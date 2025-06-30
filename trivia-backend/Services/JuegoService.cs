using Microsoft.EntityFrameworkCore;
using trivia_backend.Models;
using trivia_backend.Data;

namespace trivia_backend.Services;

public class JuegoService : IJuegoService
{
    private readonly AppDbContext _db;
    private static readonly Dictionary<int, JuegoEstado> _juegosPorSala = new();

    public JuegoService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<(bool Success, string Message, Pregunta? Pregunta)> IniciarJuegoAsync(int salaId)
    {
        try
        {
            var sala = await _db.Salas
                .Include(s => s.Jugadores)
                .FirstOrDefaultAsync(s => s.Id == salaId);

            if (sala == null)
            {
                return (false, "La sala no existe.", null);
            }

            if (sala.Jugadores.Count < 2)
            {
                return (false, "Se necesitan al menos 2 jugadores para iniciar el juego.", null);
            }

            // Obtener preguntas aleatorias
            var preguntas = await ObtenerPreguntasAsync(10);
            if (!preguntas.Any())
            {
                return (false, "No hay preguntas disponibles para el juego.", null);
            }

            // Inicializar el estado del juego
            var estadoJuego = new JuegoEstado
            {
                SalaId = salaId,
                Preguntas = preguntas,
                PreguntaActualIndex = 0,
                JugadoresPuntuacion = sala.Jugadores.ToDictionary(j => j.Nombre, j => 0),
                JuegoIniciado = true,
                JuegoTerminado = false
            };

            _juegosPorSala[salaId] = estadoJuego;

            var primeraPregunta = preguntas.First();
            return (true, "Juego iniciado exitosamente.", primeraPregunta);
        }
        catch (Exception ex)
        {
            return (false, $"Error al iniciar el juego: {ex.Message}", null);
        }
    }

    public async Task<(bool Success, string Message, bool EsCorrecta)> ResponderPreguntaAsync(int preguntaId, int respuestaId, string nombreJugador)
    {
        try
        {
            var esCorrecta = await ValidarRespuestaAsync(preguntaId, respuestaId);

            // Buscar el estado del juego por sala del jugador
            var estadoJuego = _juegosPorSala.Values.FirstOrDefault(j => j.JugadoresPuntuacion.ContainsKey(nombreJugador));

            if (estadoJuego != null && esCorrecta)
            {
                estadoJuego.JugadoresPuntuacion[nombreJugador] += 10; // 10 puntos por respuesta correcta
            }

            string mensaje = esCorrecta ? "¡Respuesta correcta!" : "Respuesta incorrecta.";
            return (true, mensaje, esCorrecta);
        }
        catch (Exception ex)
        {
            return (false, $"Error al procesar la respuesta: {ex.Message}", false);
        }
    }

    public async Task<Pregunta?> ObtenerPreguntaActualAsync(int salaId)
    {
        if (!_juegosPorSala.TryGetValue(salaId, out var estadoJuego))
        {
            return null;
        }

        if (estadoJuego.PreguntaActualIndex >= estadoJuego.Preguntas.Count)
        {
            return null;
        }

        var pregunta = estadoJuego.Preguntas[estadoJuego.PreguntaActualIndex];

        // Cargar las respuestas de la base de datos
        return await _db.Preguntas
            .Include(p => p.Respuestas)
            .FirstOrDefaultAsync(p => p.Id == pregunta.Id);
    }

    public async Task<(bool Success, string Message, Pregunta? SiguientePregunta)> SiguientePreguntaAsync(int salaId)
    {
        try
        {
            if (!_juegosPorSala.TryGetValue(salaId, out var estadoJuego))
            {
                return (false, "No hay un juego activo en esta sala.", null);
            }

            estadoJuego.PreguntaActualIndex++;

            if (estadoJuego.PreguntaActualIndex >= estadoJuego.Preguntas.Count)
            {
                // Juego terminado
                estadoJuego.JuegoTerminado = true;
                return (false, "El juego ha terminado.", null);
            }

            var siguientePregunta = await _db.Preguntas
                .Include(p => p.Respuestas)
                .FirstOrDefaultAsync(p => p.Id == estadoJuego.Preguntas[estadoJuego.PreguntaActualIndex].Id);

            return (true, "Siguiente pregunta cargada.", siguientePregunta);
        }
        catch (Exception ex)
        {
            return (false, $"Error al cargar la siguiente pregunta: {ex.Message}", null);
        }
    }

    public async Task<(bool Success, string Message)> FinalizarJuegoAsync(int salaId)
    {
        try
        {
            if (_juegosPorSala.TryGetValue(salaId, out var estadoJuego))
            {
                estadoJuego.JuegoTerminado = true;

                // Obtener ganador
                var ganador = estadoJuego.JugadoresPuntuacion
                    .OrderByDescending(kvp => kvp.Value)
                    .First();

                _juegosPorSala.Remove(salaId);

                return (true, $"Juego finalizado. Ganador: {ganador.Key} con {ganador.Value} puntos.");
            }

            return (false, "No hay un juego activo en esta sala.");
        }
        catch (Exception ex)
        {
            return (false, $"Error al finalizar el juego: {ex.Message}");
        }
    }

    public async Task<List<Pregunta>> ObtenerPreguntasAsync(int cantidad = 10)
    {
        return await _db.Preguntas
            .Include(p => p.Respuestas)
            .OrderBy(x => Guid.NewGuid()) // Orden aleatorio
            .Take(cantidad)
            .ToListAsync();
    }

    public async Task<bool> ValidarRespuestaAsync(int preguntaId, int respuestaId)
    {
        var respuesta = await _db.Respuestas
            .FirstOrDefaultAsync(r => r.Id == respuestaId && r.PreguntaId == preguntaId);

        return respuesta?.EsCorrecta ?? false;
    }

    public Task<JuegoEstadoDto?> ObtenerEstadoJuegoAsync(int salaId)
    {
        if (!_juegosPorSala.TryGetValue(salaId, out var estadoJuego))
        {
            return Task.FromResult<JuegoEstadoDto?>(null);
        }

        var dto = new JuegoEstadoDto
        {
            JuegoIniciado = estadoJuego.JuegoIniciado,
            JuegoTerminado = estadoJuego.JuegoTerminado,
            PreguntaActualIndex = estadoJuego.PreguntaActualIndex,
            TotalPreguntas = estadoJuego.Preguntas.Count,
            JugadoresPuntuacion = estadoJuego.JugadoresPuntuacion
        };

        return Task.FromResult<JuegoEstadoDto?>(dto);
    }

    public Task<ResultadosDto?> ObtenerResultadosAsync(int salaId)
    {
        if (!_juegosPorSala.TryGetValue(salaId, out var estadoJuego))
        {
            return Task.FromResult<ResultadosDto?>(null);
        }

        if (!estadoJuego.JuegoTerminado)
            return Task.FromResult<ResultadosDto?>(null);
        }

        var ganador = estadoJuego.JugadoresPuntuacion
            .OrderByDescending(p => p.Value)
            .FirstOrDefault();

        var dto = new ResultadosDto
        {
            Ganador = ganador.Key ?? "Nadie",
            PuntuacionesFinal = estadoJuego.JugadoresPuntuacion
        };

        return Task.FromResult<ResultadosDto?>(dto);
    }
}

// Clase auxiliar para manejar el estado del juego
public class JuegoEstado
{
    public int SalaId { get; set; }
    public List<Pregunta> Preguntas { get; set; } = new();
    public int PreguntaActualIndex { get; set; }
    public Dictionary<string, int> JugadoresPuntuacion { get; set; } = new();
    public bool JuegoIniciado { get; set; }
    public bool JuegoTerminado { get; set; }
}
