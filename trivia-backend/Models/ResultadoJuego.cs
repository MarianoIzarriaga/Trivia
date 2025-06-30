using System;

namespace trivia_backend.Models
{
    public class ResultadoJuego
    {
        public int Id { get; set; }
        public int SalaId { get; set; }
        public string Ganador { get; set; } = string.Empty;
        public string PuntuacionesJson { get; set; } = string.Empty; // Diccionario serializado
        public DateTime FechaFinalizacion { get; set; }
    }
}