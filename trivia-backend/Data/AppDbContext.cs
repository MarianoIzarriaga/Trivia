// Data/AppDbContext.cs
using Microsoft.EntityFrameworkCore;
using trivia_backend.Models;

public class AppDbContext : DbContext
{
    public DbSet<Jugador> Jugadores => Set<Jugador>();
    public DbSet<Pregunta> Preguntas => Set<Pregunta>();
    public DbSet<Respuesta> Respuestas => Set<Respuesta>();
    public DbSet<Sala> Salas => Set<Sala>();

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
}
