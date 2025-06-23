namespace trivia_backend.Models;


public class Sala
{
    public int Id { get; set; }
    public string Nombre { get; set; }
    public string Descripcion { get; set; }
    public int Capacidad { get; set; }
    public string Creador { get; set; }
    public DateTime FechaCreacion { get; set; }

}