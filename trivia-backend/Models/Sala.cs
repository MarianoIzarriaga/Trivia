namespace trivia_backend.Models;


public class Sala
{
    readonly int CAPACIDAD_MAXIMA = 4;
    public int Id { get; set; }
    public string Nombre { get; set; }
    public string Descripcion { get; set; }
    public int Capacidad { get; set; }
    public Jugador creador;
    public List<Jugador> Jugadores { get; set; } = new List<Jugador>();
    public DateTime FechaCreacion { get; set; }

}