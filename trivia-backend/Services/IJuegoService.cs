using trivia_backend.Models;

namespace trivia_backend.Services;

public interface IJuegoService
{
    Task<(bool Success, string Message, Pregunta? Pregunta)> IniciarJuegoAsync(int salaId);
    Task<(bool Success, string Message, bool EsCorrecta)> ResponderPreguntaAsync(int preguntaId, int respuestaId, string nombreJugador);
    Task<Pregunta?> ObtenerPreguntaActualAsync(int salaId, string? nombreJugador = null);
    Task<(bool Success, string Message, Pregunta? SiguientePregunta)> SiguientePreguntaAsync(int salaId, string nombreJugador);
    Task<(bool Success, string Message)> FinalizarJuegoAsync(int salaId);
    Task<List<Pregunta>> ObtenerPreguntasAsync(int cantidad = 10);
    Task<bool> ValidarRespuestaAsync(int preguntaId, int respuestaId);
    Task<JuegoEstadoDto?> ObtenerEstadoJuegoAsync(int salaId);
    Task<ResultadosDto?> ObtenerResultadosAsync(int salaId);
}

public class JuegoEstadoDto
{
    public bool JuegoIniciado { get; set; }
    public bool JuegoTerminado { get; set; }
    public int PreguntaActualIndex { get; set; }
    public int TotalPreguntas { get; set; }
    public Dictionary<string, int> JugadoresPuntuacion { get; set; } = new();
}

public class ResultadosDto
{
    public string Ganador { get; set; } = string.Empty;
    public Dictionary<string, int> PuntuacionesFinal { get; set; } = new();
}
