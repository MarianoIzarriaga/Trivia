namespace trivia_backend.Models;
using System.ComponentModel.DataAnnotations;



public class Pregunta
{
    [Key]
    public int Id { get; set; }
    public string Texto { get; set; } 

    public List<Respuesta> Respuestas { get; set; } = new List<Respuesta>();
}