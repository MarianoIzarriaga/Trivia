using trivia_backend.Models;

namespace trivia_backend.Services;

public interface IJuegoService
{
    Task<(bool Success, string Message, Pregunta? Pregunta)> IniciarJuegoAsync(int salaId);
    Task<(bool Success, string Message, bool EsCorrecta)> ResponderPreguntaAsync(int preguntaId, int respuestaId, string nombreJugador);
    Task<Pregunta?> ObtenerPreguntaActualAsync(int salaId);
    Task<(bool Success, string Message, Pregunta? SiguientePregunta)> SiguientePreguntaAsync(int salaId);
    Task<(bool Success, string Message)> FinalizarJuegoAsync(int salaId);
    Task<List<Pregunta>> ObtenerPreguntasAsync(int cantidad = 10);
    Task<bool> ValidarRespuestaAsync(int preguntaId, int respuestaId);
}
