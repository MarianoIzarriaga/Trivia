namespace trivia_backend.Models;


public class Respuesta
{
    public int Id { get; set; }
    public required string Texto { get; set; }
    public bool EsCorrecta { get; set; }
    public int PreguntaId { get; set; }
    public Pregunta? Pregunta { get; set; }
}