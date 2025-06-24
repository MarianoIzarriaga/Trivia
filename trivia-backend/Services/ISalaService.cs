using trivia_backend.Models;

namespace trivia_backend.Services;

public interface ISalaService
{
    Task<(bool Success, string Message, Sala? Sala)> CrearSalaAsync(string nombreJugador);
    Task<(bool Success, string Message, Sala? Sala)> UnirseSalaAsync(string codigoSala, string nombreJugador);
    Task<(bool Success, string Message)> SalirDeSalaAsync(string nombreJugador, int salaId);
    Task<Sala?> ObtenerSalaPorCodigoAsync(string codigoSala);
    Task<List<Sala>> ObtenerSalasDisponiblesAsync();
    Task<bool> EliminarSalaAsync(int salaId);
}
