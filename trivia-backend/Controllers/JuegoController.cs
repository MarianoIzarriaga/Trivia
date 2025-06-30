using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using trivia_backend.Services;

namespace trivia_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JuegoController : ControllerBase
{
    private readonly IJuegoService _juegoService;

    public JuegoController(IJuegoService juegoService)
    {
        _juegoService = juegoService;
    }

    [HttpPost("iniciar/{salaId}")]
    public async Task<IActionResult> IniciarJuego(int salaId)
    {
        var resultado = await _juegoService.IniciarJuegoAsync(salaId);

        if (!resultado.Success)
        {
            return BadRequest(new { mensaje = resultado.Message });
        }

        return Ok(new
        {
            mensaje = resultado.Message,
            pregunta = new
            {
                id = resultado.Pregunta!.Id,
                texto = resultado.Pregunta.Texto,
                respuestas = resultado.Pregunta.Respuestas.Select(r => new
                {
                    id = r.Id,
                    texto = r.Texto
                })
            }
        });
    }

    [HttpPost("responder")]
    public async Task<IActionResult> ResponderPregunta([FromBody] ResponderRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var resultado = await _juegoService.ResponderPreguntaAsync(
            request.PreguntaId,
            request.RespuestaId,
            request.NombreJugador
        );

        if (!resultado.Success)
        {
            return BadRequest(new { mensaje = resultado.Message });
        }

        return Ok(new
        {
            mensaje = resultado.Message,
            esCorrecta = resultado.EsCorrecta
        });
    }

    [HttpGet("pregunta-actual/{salaId}")]
    public async Task<IActionResult> ObtenerPreguntaActual(int salaId)
    {
        var pregunta = await _juegoService.ObtenerPreguntaActualAsync(salaId);

        if (pregunta == null)
        {
            return NotFound(new { mensaje = "No hay pregunta activa para esta sala." });
        }

        return Ok(new
        {
            id = pregunta.Id,
            texto = pregunta.Texto,
            respuestas = pregunta.Respuestas.Select(r => new
            {
                id = r.Id,
                texto = r.Texto
            })
        });
    }

    public class SiguientePreguntaRequest
    {
        public required string NombreJugador { get; set; }
    }

    [HttpPost("siguiente-pregunta/{salaId}")]
    public async Task<IActionResult> SiguientePregunta(int salaId, [FromBody] SiguientePreguntaRequest request)
    {
        var resultado = await _juegoService.SiguientePreguntaAsync(salaId, request.NombreJugador);

        if (!resultado.Success)
        {
            return BadRequest(new { mensaje = resultado.Message });
        }

        return Ok(new
        {
            mensaje = resultado.Message,
            pregunta = new
            {
                id = resultado.SiguientePregunta!.Id,
                texto = resultado.SiguientePregunta.Texto,
                respuestas = resultado.SiguientePregunta.Respuestas.Select(r => new
                {
                    id = r.Id,
                    texto = r.Texto
                })
            }
        });
    }

    [HttpPost("finalizar/{salaId}")]
    public async Task<IActionResult> FinalizarJuego(int salaId)
    {
        var resultado = await _juegoService.FinalizarJuegoAsync(salaId);

        if (!resultado.Success)
        {
            return BadRequest(new { mensaje = resultado.Message });
        }

        return Ok(new { mensaje = resultado.Message });
    }

    [HttpGet("estado/{salaId}")]
    public async Task<IActionResult> ObtenerEstadoJuego(int salaId, [FromQuery] string? nombreJugador = null)
    {
        var estado = await _juegoService.ObtenerEstadoJuegoAsync(salaId);

        if (estado == null)
        {
            return NotFound(new { mensaje = "No se encontró el juego para esta sala." });
        }

        // Obtener la pregunta actual del jugador si se provee el nombre
        object? preguntaActualJugador = null;
        int? preguntaNumeroJugador = null;
        if (!string.IsNullOrEmpty(nombreJugador))
        {
            var pregunta = await _juegoService.ObtenerPreguntaActualAsync(salaId, nombreJugador);
            if (pregunta != null)
            {
                preguntaActualJugador = new
                {
                    id = pregunta.Id,
                    texto = pregunta.Texto,
                    respuestas = pregunta.Respuestas.Select(r => new { id = r.Id, texto = r.Texto })
                };
            }
            // Calcular el número de pregunta individual (1-based)
            var idx = Services.JuegoService.GetProgresoPorJugador(salaId, nombreJugador);
            if (idx.HasValue)
            {
                preguntaNumeroJugador = idx.Value + 1;
            }
        }

        return Ok(new
        {
            juegoIniciado = estado.JuegoIniciado,
            juegoTerminado = estado.JuegoTerminado,
            preguntaActual = estado.PreguntaActualIndex + 1,
            totalPreguntas = estado.TotalPreguntas,
            puntuaciones = estado.JugadoresPuntuacion,
            preguntaActualJugador,
            preguntaNumeroJugador
        });
    }

    [HttpGet("resultados/{salaId}")]
    public async Task<IActionResult> ObtenerResultados(int salaId)
    {
        var resultados = await _juegoService.ObtenerResultadosAsync(salaId);

        if (resultados == null)
        {
            // Intentar buscar en la base de datos directamente si el servicio no lo hizo
            using (var scope = HttpContext.RequestServices.CreateScope())
            {
                var db = scope.ServiceProvider.GetService(typeof(trivia_backend.Data.AppDbContext)) as trivia_backend.Data.AppDbContext;
                if (db != null)
                {
                    var resultadoDb = await db.ResultadosJuego.FirstOrDefaultAsync(r => r.SalaId == salaId);
                    if (resultadoDb != null)
                    {
                        var puntuaciones = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, int>>(resultadoDb.PuntuacionesJson) ?? new();
                        return Ok(new
                        {
                            ganador = resultadoDb.Ganador,
                            puntuacionesFinal = puntuaciones.OrderByDescending(p => p.Value)
                        });
                    }
                }
            }
            return NotFound(new { mensaje = "No se encontraron resultados para esta sala. (ni en memoria ni en la base de datos)" });
        }

        return Ok(new
        {
            ganador = resultados.Ganador,
            puntuacionesFinal = resultados.PuntuacionesFinal.OrderByDescending(p => p.Value)
        });
    }

    [HttpGet("stream/{salaId}")]
    public async Task StreamEstadoJuego(int salaId)
    {
        Response.Headers["Content-Type"] = "text/event-stream";
        Response.Headers["Cache-Control"] = "no-cache";
        Response.Headers["Connection"] = "keep-alive";

        var cancellationToken = HttpContext.RequestAborted;
        while (!cancellationToken.IsCancellationRequested)
        {
            var estado = await _juegoService.ObtenerEstadoJuegoAsync(salaId);
            if (estado != null)
            {
                var progresoPorJugador = Services.JuegoService.GetProgresoPorJugadorPorSala(salaId);
                var data = new
                {
                    juegoIniciado = estado.JuegoIniciado,
                    juegoTerminado = estado.JuegoTerminado,
                    preguntaActual = estado.PreguntaActualIndex + 1,
                    totalPreguntas = estado.TotalPreguntas,
                    puntuaciones = estado.JugadoresPuntuacion,
                    progresoPorJugador // nuevo: para que el frontend sepa el estado de cada jugador
                };
                var json = System.Text.Json.JsonSerializer.Serialize(data);
                await Response.WriteAsync($"data: {json}\n\n");
                await Response.Body.FlushAsync();
            }
            await Task.Delay(2000, cancellationToken);
        }
    }

    public class PreguntaActualRequest
    {
        public required string NombreJugador { get; set; }
    }

    [HttpPost("pregunta-actual/{salaId}")]
    public async Task<IActionResult> ObtenerPreguntaActualPorJugador(int salaId, [FromBody] PreguntaActualRequest request)
    {
        var pregunta = await _juegoService.ObtenerPreguntaActualAsync(salaId, request.NombreJugador);
        if (pregunta == null)
        {
            return NotFound(new { mensaje = "No hay pregunta activa para este jugador en esta sala." });
        }
        return Ok(new
        {
            id = pregunta.Id,
            texto = pregunta.Texto,
            respuestas = pregunta.Respuestas.Select(r => new { id = r.Id, texto = r.Texto })
        });
    }
}

public class ResponderRequest
{
    public int PreguntaId { get; set; }
    public int RespuestaId { get; set; }
    public required string NombreJugador { get; set; }
}
