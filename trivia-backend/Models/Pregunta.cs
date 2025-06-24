namespace trivia_backend.Models;

using System.ComponentModel.DataAnnotations;



public class Pregunta
{
    [Key]
    public int Id { get; set; }
    public required string Texto { get; set; }
    public string Categoria { get; set; } = "General";
    public string Dificultad { get; set; } = "Facil";

    public List<Respuesta> Respuestas { get; set; } = new List<Respuesta>();
}