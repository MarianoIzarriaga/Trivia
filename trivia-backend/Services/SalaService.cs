using Microsoft.EntityFrameworkCore;
using trivia_backend.Models;
using trivia_backend.Data;

namespace trivia_backend.Services;

public class SalaService : ISalaService
{
    private readonly AppDbContext _db;

    public SalaService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<(bool Success, string Message, Sala? Sala)> CrearSalaAsync(string nombreJugador)
    {
        if (string.IsNullOrEmpty(nombreJugador))
        {
            return (false, "El nombre del jugador no puede estar vacío.", null);
        }

        try
        {
            // Generar código único para la sala
            string codigoSala = GenerarCodigoSala();

            // Crear el jugador creador
            var jugadorCreador = new Jugador { Nombre = nombreJugador };
            _db.Jugadores.Add(jugadorCreador);
            await _db.SaveChangesAsync();

            // Crear la sala
            var sala = new Sala
            {
                Nombre = codigoSala,
                Descripcion = $"Sala creada por {nombreJugador}",
                Capacidad = 4,
                CreadorId = jugadorCreador.Id,
                creador = jugadorCreador,
                FechaCreacion = DateTime.Now
            };

            // Establecer la relación entre jugador y sala
            jugadorCreador.SalaId = sala.Id;
            jugadorCreador.Sala = sala;

            sala.Jugadores.Add(jugadorCreador);
            _db.Salas.Add(sala);
            await _db.SaveChangesAsync();

            return (true, "Sala creada exitosamente.", sala);
        }
        catch (Exception ex)
        {
            return (false, $"Error al crear la sala: {ex.Message}", null);
        }
    }

    public async Task<(bool Success, string Message, Sala? Sala)> UnirseSalaAsync(string codigoSala, string nombreJugador)
    {
        if (string.IsNullOrEmpty(codigoSala))
        {
            return (false, "El código de sala no puede estar vacío.", null);
        }

        if (string.IsNullOrEmpty(nombreJugador))
        {
            return (false, "El nombre del jugador no puede estar vacío.", null);
        }

        try
        {
            // Buscar la sala por código
            var sala = await _db.Salas
                .Include(s => s.Jugadores)
                .Include(s => s.creador)
                .FirstOrDefaultAsync(s => s.Nombre == codigoSala);

            if (sala == null)
            {
                return (false, "La sala con el código proporcionado no existe.", null);
            }

            // Verificar si la sala está llena
            if (sala.Jugadores.Count >= sala.Capacidad)
            {
                return (false, "La sala está llena.", null);
            }

            // Verificar si el jugador ya está en la sala
            if (sala.Jugadores.Any(j => j.Nombre == nombreJugador))
            {
                return (false, "Ya existe un jugador con ese nombre en la sala.", null);
            }

            // Crear el nuevo jugador
            var nuevoJugador = new Jugador { Nombre = nombreJugador, SalaId = sala.Id };
            _db.Jugadores.Add(nuevoJugador);
            await _db.SaveChangesAsync();

            // Agregar el jugador a la sala
            sala.Jugadores.Add(nuevoJugador);
            await _db.SaveChangesAsync();

            return (true, $"Te has unido exitosamente a la sala {codigoSala}.", sala);
        }
        catch (Exception ex)
        {
            return (false, $"Error al unirse a la sala: {ex.Message}", null);
        }
    }

    public async Task<(bool Success, string Message)> SalirDeSalaAsync(string nombreJugador, int salaId)
    {
        if (string.IsNullOrEmpty(nombreJugador))
        {
            return (false, "El nombre del jugador no puede estar vacío.");
        }

        try
        {
            // Buscar la sala
            var sala = await _db.Salas
                .Include(s => s.Jugadores)
                .Include(s => s.creador)
                .FirstOrDefaultAsync(s => s.Id == salaId);

            if (sala == null)
            {
                return (false, "La sala no existe.");
            }

            // Buscar el jugador en la sala
            var jugador = sala.Jugadores.FirstOrDefault(j => j.Nombre == nombreJugador);
            if (jugador == null)
            {
                return (false, "El jugador no está en esta sala.");
            }

            // Remover el jugador de la sala
            sala.Jugadores.Remove(jugador);
            jugador.SalaId = null;
            jugador.Sala = null;

            // Si el jugador era el creador y hay otros jugadores, asignar un nuevo creador
            if (sala.CreadorId == jugador.Id && sala.Jugadores.Count > 0)
            {
                var nuevoCreador = sala.Jugadores.First();
                sala.CreadorId = nuevoCreador.Id;
                sala.creador = nuevoCreador;
            }

            // Si no quedan jugadores, eliminar la sala
            if (sala.Jugadores.Count == 0)
            {
                _db.Salas.Remove(sala);
            }

            // Eliminar el jugador de la base de datos
            _db.Jugadores.Remove(jugador);
            await _db.SaveChangesAsync();

            return (true, "Has salido de la sala exitosamente.");
        }
        catch (Exception ex)
        {
            return (false, $"Error al salir de la sala: {ex.Message}");
        }
    }

    public async Task<Sala?> ObtenerSalaPorCodigoAsync(string codigoSala)
    {
        return await _db.Salas
            .Include(s => s.Jugadores)
            .Include(s => s.creador)
            .FirstOrDefaultAsync(s => s.Nombre == codigoSala);
    }

    public async Task<List<Sala>> ObtenerSalasDisponiblesAsync()
    {
        return await _db.Salas
            .Include(s => s.Jugadores)
            .Include(s => s.creador)
            .Where(s => s.Jugadores.Count < s.Capacidad)
            .OrderByDescending(s => s.FechaCreacion)
            .ToListAsync();
    }

    public async Task<bool> EliminarSalaAsync(int salaId)
    {
        try
        {
            var sala = await _db.Salas
                .Include(s => s.Jugadores)
                .FirstOrDefaultAsync(s => s.Id == salaId);

            if (sala == null)
            {
                return false;
            }

            // Remover todos los jugadores de la sala
            foreach (var jugador in sala.Jugadores.ToList())
            {
                jugador.SalaId = null;
                jugador.Sala = null;
                _db.Jugadores.Remove(jugador);
            }

            _db.Salas.Remove(sala);
            await _db.SaveChangesAsync();
            return true;
        }
        catch
        {
            return false;
        }
    }

    private string GenerarCodigoSala()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        string codigo;

        do
        {
            codigo = new string(Enumerable.Repeat(chars, 6)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
        while (_db.Salas.Any(s => s.Nombre == codigo));

        return codigo;
    }
}
