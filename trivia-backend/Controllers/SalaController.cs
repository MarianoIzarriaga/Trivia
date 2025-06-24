using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using trivia_backend.Models;
using trivia_backend.Services;
using System.Text;
using System.Text.Json;

namespace trivia_backend.Controllers;

public class SalaController : Controller
{
    private readonly ISalaService _salaService;

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
                        timestamp = DateTime.UtcNow
                    };

                    var json = JsonSerializer.Serialize(salaData);
                    var data = $"data: {json}\n\n";

                    await Response.WriteAsync(data, cancellationToken);
                    await Response.Body.FlushAsync(cancellationToken);
                }

                await Task.Delay(2000, cancellationToken); // Enviar actualizaciones cada 2 segundos
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
