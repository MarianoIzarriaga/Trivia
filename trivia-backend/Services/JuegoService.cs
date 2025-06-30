using Microsoft.EntityFrameworkCore;
using trivia_backend.Models;
using trivia_backend.Data;
using System.Text.Json;

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

            var preguntas = await ObtenerPreguntasAsync(3);
            if (!preguntas.Any())
            {
                return (false, "No hay preguntas disponibles para el juego.", null);
            }

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

            var primeraPregunta = preguntas[0];
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

            var estadoJuego = _juegosPorSala.Values.FirstOrDefault(j => j.JugadoresPuntuacion != null && j.JugadoresPuntuacion.ContainsKey(nombreJugador));

            if (estadoJuego != null)
            {
                if (estadoJuego.ProgresoPorJugador == null)
                    estadoJuego.ProgresoPorJugador = new Dictionary<string, int>();
                if (!estadoJuego.ProgresoPorJugador.ContainsKey(nombreJugador))
                    estadoJuego.ProgresoPorJugador[nombreJugador] = 0;

                if (esCorrecta)
                {
                    if (estadoJuego.JugadoresPuntuacion == null)
                        estadoJuego.JugadoresPuntuacion = new Dictionary<string, int>();
                    estadoJuego.JugadoresPuntuacion[nombreJugador] += 10; 
                }
            }
            else
            {
                return (false, "No se encontró el estado del juego para el jugador.", false);
            }

            string mensaje = esCorrecta ? "¡Respuesta correcta!" : "Respuesta incorrecta.";
            return (true, mensaje, esCorrecta);
        }
        catch (Exception ex)
        {
            return (false, $"Error al procesar la respuesta: {ex.Message}", false);
        }
    }

    public async Task<Pregunta?> ObtenerPreguntaActualAsync(int salaId, string? nombreJugador = null)
    {
        if (!_juegosPorSala.TryGetValue(salaId, out var estadoJuego))
        {
            return null;
        }

        int index;
        if (!string.IsNullOrEmpty(nombreJugador) && estadoJuego.ProgresoPorJugador.ContainsKey(nombreJugador))
        {
            index = estadoJuego.ProgresoPorJugador[nombreJugador];
        }
        else
        {
            index = estadoJuego.PreguntaActualIndex;
        }

        if (index >= estadoJuego.Preguntas.Count)
        {
            return null;
        }

        var pregunta = estadoJuego.Preguntas[index];

        return await _db.Preguntas
            .Include(p => p.Respuestas)
            .FirstOrDefaultAsync(p => p.Id == pregunta.Id);
    }

    public async Task<(bool Success, string Message, Pregunta? SiguientePregunta)> SiguientePreguntaAsync(int salaId, string nombreJugador)
    {
        try
        {
            if (!_juegosPorSala.TryGetValue(salaId, out var estadoJuego))
            {
                return (false, "No hay un juego activo en esta sala.", null);
            }

            if (!estadoJuego.ProgresoPorJugador.ContainsKey(nombreJugador))
                estadoJuego.ProgresoPorJugador[nombreJugador] = 0;

            estadoJuego.ProgresoPorJugador[nombreJugador]++;

            int indice = estadoJuego.ProgresoPorJugador[nombreJugador];

            bool todosTerminaron = estadoJuego.ProgresoPorJugador.Count > 0 &&
                estadoJuego.ProgresoPorJugador.All(kvp => kvp.Value >= estadoJuego.Preguntas.Count);
            if (todosTerminaron)
            {
                estadoJuego.JuegoTerminado = true;
            }

            if (indice >= estadoJuego.Preguntas.Count)
            {
                return (false, "El juego ha terminado para este jugador.", null);
            }

            var siguientePregunta = await _db.Preguntas
                .Include(p => p.Respuestas)
                .FirstOrDefaultAsync(p => p.Id == estadoJuego.Preguntas[indice].Id);

            return (true, "Siguiente pregunta cargada.", siguientePregunta);
        }
        catch (Exception ex)
        {
            return (false, $"Error al cargar la siguiente pregunta: {ex.Message}", null);
        }
    }

    private async Task GuardarResultadosSiNoExistenAsync(int salaId, string ganador, Dictionary<string, int> puntuaciones)
    {
        bool existe = await _db.ResultadosJuego.AnyAsync(r => r.SalaId == salaId);
        if (existe) return;
        var resultado = new ResultadoJuego
        {
            SalaId = salaId,
            Ganador = ganador,
            PuntuacionesJson = JsonSerializer.Serialize(puntuaciones),
            FechaFinalizacion = DateTime.UtcNow
        };
        _db.ResultadosJuego.Add(resultado);
        await _db.SaveChangesAsync();
    }

    public async Task<(bool Success, string Message)> FinalizarJuegoAsync(int salaId)
    {
        if (_juegosPorSala.TryGetValue(salaId, out var estadoJuego))
        {
            estadoJuego.JuegoTerminado = true;
            var ganador = estadoJuego.JugadoresPuntuacion
                .OrderByDescending(kvp => kvp.Value)
                .FirstOrDefault();
            // Guardar resultados en la base de datos
            await GuardarResultadosSiNoExistenAsync(salaId, ganador.Key ?? "Nadie", estadoJuego.JugadoresPuntuacion);
            return (true, $"Juego finalizado. Ganador: {ganador.Key} con {ganador.Value} puntos.");
        }
        return (false, "No hay un juego activo en esta sala.");
    }

    public async Task<List<Pregunta>> ObtenerPreguntasAsync(int cantidad = 10)
    {
        return await _db.Preguntas
            .Include(p => p.Respuestas)
            .OrderBy(x => Guid.NewGuid())
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

        if (!estadoJuego.JuegoTerminado && estadoJuego.ProgresoPorJugador.Count > 0)
        {
            int total = estadoJuego.Preguntas.Count;
            var jugadoresSala = estadoJuego.JugadoresPuntuacion.Keys;
            bool todosTerminaron = jugadoresSala.All(nombre =>
                estadoJuego.ProgresoPorJugador.TryGetValue(nombre, out var idx) && idx >= (total - 1)
            );
            if (todosTerminaron)
            {
                estadoJuego.JuegoTerminado = true;
            }
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

    public async Task<ResultadosDto?> ObtenerResultadosAsync(int salaId)
    {
        if (_juegosPorSala.TryGetValue(salaId, out var estadoJuego))
        {
            if (!estadoJuego.JuegoTerminado)
                return null;
            var ganador = estadoJuego.JugadoresPuntuacion
                .OrderByDescending(p => p.Value)
                .FirstOrDefault();
            // Guardar resultados si aún no están
            await GuardarResultadosSiNoExistenAsync(salaId, ganador.Key ?? "Nadie", estadoJuego.JugadoresPuntuacion);
            return new ResultadosDto
            {
                Ganador = ganador.Key ?? "Nadie",
                PuntuacionesFinal = estadoJuego.JugadoresPuntuacion
            };
        }
        // Si no está en memoria, buscar en la base de datos
        var resultadoDb = await _db.ResultadosJuego.FirstOrDefaultAsync(r => r.SalaId == salaId);
        if (resultadoDb == null) return null;
        var puntuaciones = JsonSerializer.Deserialize<Dictionary<string, int>>(resultadoDb.PuntuacionesJson) ?? new();
        return new ResultadosDto
        {
            Ganador = resultadoDb.Ganador,
            PuntuacionesFinal = puntuaciones
        };
    }

    // Permite obtener el índice de pregunta individual de un jugador (para el controlador)
    public static int? GetProgresoPorJugador(int salaId, string nombreJugador)
    {
        if (_juegosPorSala.TryGetValue(salaId, out var estadoJuego) &&
            estadoJuego.ProgresoPorJugador.TryGetValue(nombreJugador, out var idx))
        {
            return idx;
        }
        return null;
    }

    // Permite obtener el progreso de todos los jugadores de una sala (para el stream SSE)
    public static Dictionary<string, int> GetProgresoPorJugadorPorSala(int salaId)
    {
        if (_juegosPorSala.TryGetValue(salaId, out var estadoJuego))
        {
            // Devuelve una copia para evitar problemas de concurrencia
            return new Dictionary<string, int>(estadoJuego.ProgresoPorJugador);
        }
        return new Dictionary<string, int>();
    }
}

public class JuegoEstado
{
    public int SalaId { get; set; }
    public List<Pregunta> Preguntas { get; set; } = new();
    public int PreguntaActualIndex { get; set; } // DEPRECATED: solo para compatibilidad
    public Dictionary<string, int> JugadoresPuntuacion { get; set; } = new();
    public bool JuegoIniciado { get; set; }
    public bool JuegoTerminado { get; set; }
    // Nuevo: progreso individual de cada jugador
    public Dictionary<string, int> ProgresoPorJugador { get; set; } = new();
}
