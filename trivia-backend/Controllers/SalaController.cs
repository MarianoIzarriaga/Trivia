using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using trivia_backend.Models;
using trivia_backend.Services;
using System.Text;
using System.Text.Json;
using System.Collections.Concurrent;

namespace trivia_backend.Controllers;

[Route("[controller]/[action]")]
public class SalaController : Controller
{
    private readonly ISalaService _salaService;
    private static readonly ConcurrentDictionary<string, GameCountdownState> _countdownStates = new();

    public SalaController(ISalaService salaService)
    {
        _salaService = salaService;
    }


    /*
        * crear sala
        * unirse a sala con un codigo
        * salir de la sala
    
    */

    [HttpPost]
    public async Task<IActionResult> CrearSala(string nombreJugador)
    {
        var resultado = await _salaService.CrearSalaAsync(nombreJugador);

        if (!resultado.Success)
        {
            return BadRequest(resultado.Message);
        }

        return Ok(new
        {
            mensaje = resultado.Message,
            codigoSala = resultado.Sala!.Nombre,
            salaId = resultado.Sala.Id,
            jugadores = resultado.Sala.Jugadores.Count
        });
    }


    [HttpPost]
    public async Task<IActionResult> UnirseSala(string codigoSala, string nombreJugador)
    {
        var resultado = await _salaService.UnirseSalaAsync(codigoSala, nombreJugador);

        if (!resultado.Success)
        {
            return BadRequest(resultado.Message);
        }

        return Ok(new
        {
            mensaje = resultado.Message,
            salaId = resultado.Sala!.Id,
            jugadores = resultado.Sala.Jugadores.Count,
            capacidad = resultado.Sala.Capacidad
        });
    }

    [HttpPost]
    public async Task<IActionResult> SalirDeSala(string nombreJugador, int salaId)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var resultado = await _salaService.SalirDeSalaAsync(nombreJugador, salaId);

        if (!resultado.Success)
        {
            return BadRequest(resultado.Message);
        }

        return Ok(new { mensaje = resultado.Message });
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerSalasDisponibles()
    {
        var salas = await _salaService.ObtenerSalasDisponiblesAsync();

        var salasInfo = salas.Select(s => new
        {
            id = s.Id,
            nombre = s.Nombre,
            descripcion = s.Descripcion,
            jugadores = s.Jugadores.Count,
            capacidad = s.Capacidad,
            creador = s.creador?.Nombre
        });

        return Ok(salasInfo);
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerSalaPorCodigo(string codigo)
    {
        var sala = await _salaService.ObtenerSalaPorCodigoAsync(codigo);

        if (sala == null)
        {
            return NotFound(new { mensaje = "Sala no encontrada" });
        }

        return Ok(new
        {
            id = sala.Id,
            codigo = sala.Nombre,
            descripcion = sala.Descripcion,
            jugadores = sala.Jugadores.Select(j => j.Nombre).ToList(),
            capacidad = sala.Capacidad,
            creador = sala.creador?.Nombre
        });
    }

    [HttpPost("iniciar-cuenta-regresiva/{codigo}")]
    public async Task<IActionResult> IniciarCuentaRegresiva(string codigo)
    {
        var sala = await _salaService.ObtenerSalaPorCodigoAsync(codigo);
        
        if (sala == null)
        {
            return NotFound(new { mensaje = "Sala no encontrada" });
        }

        if (sala.Jugadores.Count < 2)
        {
            return BadRequest(new { mensaje = "Se necesitan al menos 2 jugadores para iniciar el juego" });
        }

        // Iniciar cuenta regresiva
        var countdownState = new GameCountdownState
        {
            SalaId = sala.Id,
            Codigo = codigo,
            CountdownValue = 5,
            IsActive = true,
            StartTime = DateTime.UtcNow
        };

        _countdownStates[codigo] = countdownState;

        // Iniciar tarea en segundo plano para manejar la cuenta regresiva
        _ = Task.Run(async () => await HandleCountdown(codigo));

        return Ok(new { mensaje = "Cuenta regresiva iniciada" });
    }

    private static async Task HandleCountdown(string codigo)
    {
        if (!_countdownStates.TryGetValue(codigo, out var state))
            return;

        try
        {
            for (int i = 5; i > 0; i--)
            {
                state.CountdownValue = i;
                await Task.Delay(1000);
                
                if (!state.IsActive)
                    break;
            }

            if (state.IsActive)
            {
                state.CountdownValue = 0;
                state.IsActive = false;
            }
        }
        finally
        {
            _countdownStates.TryRemove(codigo, out _);
        }
    }

    [HttpGet]
    public async Task SalaEvents(string codigo)
    {
        Response.Headers["Content-Type"] = "text/event-stream";
        Response.Headers["Cache-Control"] = "no-cache";
        Response.Headers["Connection"] = "keep-alive";
        Response.Headers["Access-Control-Allow-Origin"] = "*";

        var cancellationToken = HttpContext.RequestAborted;

        try
        {
            while (!cancellationToken.IsCancellationRequested)
            {
                var sala = await _salaService.ObtenerSalaPorCodigoAsync(codigo);

                if (sala != null)
                {
                    var salaData = new
                    {
                        id = sala.Id,
                        codigo = sala.Nombre,
                        jugadores = sala.Jugadores.Select(j => j.Nombre).ToList(),
                        capacidad = sala.Capacidad,
                        creador = sala.creador?.Nombre,
                        timestamp = DateTime.UtcNow,
                        // Agregar información de cuenta regresiva
                        countdown = _countdownStates.TryGetValue(codigo, out var countdownState) ? new
                        {
                            isActive = countdownState.IsActive,
                            value = countdownState.CountdownValue,
                            startTime = countdownState.StartTime
                        } : null
                    };

                    var json = JsonSerializer.Serialize(salaData);
                    var data = $"data: {json}\n\n";

                    await Response.WriteAsync(data, cancellationToken);
                    await Response.Body.FlushAsync(cancellationToken);
                }

                await Task.Delay(500, cancellationToken); // Enviar actualizaciones cada 500ms para mejor sincronización
            }
        }
        catch (OperationCanceledException)
        {
            // El cliente desconectó, esto es normal
        }
    }

    public IActionResult Index()
    {
        return View();
    }

}

// Clase para manejar el estado de la cuenta regresiva
public class GameCountdownState
{
    public int SalaId { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public int CountdownValue { get; set; }
    public bool IsActive { get; set; }
    public DateTime StartTime { get; set; }
}
