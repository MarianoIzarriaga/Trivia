using Microsoft.AspNetCore.Mvc;
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

    [HttpPost("siguiente-pregunta/{salaId}")]
    public async Task<IActionResult> SiguientePregunta(int salaId)
    {
        var resultado = await _juegoService.SiguientePreguntaAsync(salaId);

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
    public async Task<IActionResult> ObtenerEstadoJuego(int salaId)
    {
        var estado = await _juegoService.ObtenerEstadoJuegoAsync(salaId);

        if (estado == null)
        {
            return NotFound(new { mensaje = "No se encontró el juego para esta sala." });
        }

        return Ok(new
        {
            juegoIniciado = estado.JuegoIniciado,
            juegoTerminado = estado.JuegoTerminado,
            preguntaActual = estado.PreguntaActualIndex + 1,
            totalPreguntas = estado.TotalPreguntas,
            puntuaciones = estado.JugadoresPuntuacion
        });
    }

    [HttpGet("resultados/{salaId}")]
    public async Task<IActionResult> ObtenerResultados(int salaId)
    {
        var resultados = await _juegoService.ObtenerResultadosAsync(salaId);

        if (resultados == null)
        {
            return NotFound(new { mensaje = "No se encontraron resultados para esta sala." });
        }

        return Ok(new
        {
            ganador = resultados.Ganador,
            puntuacionesFinal = resultados.PuntuacionesFinal.OrderByDescending(p => p.Value)
        });
    }
}

public class ResponderRequest
{
    public int PreguntaId { get; set; }
    public int RespuestaId { get; set; }
    public required string NombreJugador { get; set; }
}
