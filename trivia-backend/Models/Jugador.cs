namespace trivia_backend.Models;


public class Jugador
{
    public int Id { get; set; }
    public required string Nombre { get; set; }
    public int? SalaId { get; set; }
    public Sala? Sala { get; set; }
}