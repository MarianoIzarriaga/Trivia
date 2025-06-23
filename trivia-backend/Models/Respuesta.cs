namespace trivia_backend.Models;


public class Respuesta
{
    public int Id { get; set; }
    public string Texto { get; set; } 
    public bool EsCorrecta { get; set; }  
}