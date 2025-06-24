namespace trivia_backend.Models;


public class Sala
{
    public const int CAPACIDAD_MAXIMA = 10;
    public int Id { get; set; }
    public required string Nombre { get; set; }
    public string? Descripcion { get; set; }
    public int Capacidad { get; set; } = Sala.CAPACIDAD_MAXIMA;
    public int? CreadorId { get; set; }
    public Jugador? creador { get; set; }
    public List<Jugador> Jugadores { get; set; } = new List<Jugador>();
    public DateTime FechaCreacion { get; set; }
}