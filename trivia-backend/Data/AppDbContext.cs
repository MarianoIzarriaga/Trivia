// Data/AppDbContext.cs
using Microsoft.EntityFrameworkCore;
using trivia_backend.Models;

namespace trivia_backend.Data;

public class AppDbContext : DbContext
{
    public DbSet<Jugador> Jugadores => Set<Jugador>();
    public DbSet<Pregunta> Preguntas => Set<Pregunta>();
    public DbSet<Respuesta> Respuestas => Set<Respuesta>();
    public DbSet<Sala> Salas => Set<Sala>();
    public DbSet<ResultadoJuego> ResultadosJuego => Set<ResultadoJuego>();

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configurar relación entre Sala y Jugador (creador)
        modelBuilder.Entity<Sala>()
            .HasOne(s => s.creador)
            .WithMany()
            .HasForeignKey(s => s.CreadorId)
            .OnDelete(DeleteBehavior.SetNull);

        // Configurar relación entre Sala y Jugadores (uno a muchos)
        modelBuilder.Entity<Jugador>()
            .HasOne(j => j.Sala)
            .WithMany(s => s.Jugadores)
            .HasForeignKey(j => j.SalaId)
            .OnDelete(DeleteBehavior.SetNull);

        // Configurar relación entre Pregunta y Respuestas
        modelBuilder.Entity<Respuesta>()
            .HasOne(r => r.Pregunta)
            .WithMany(p => p.Respuestas)
            .HasForeignKey(r => r.PreguntaId)
            .OnDelete(DeleteBehavior.Cascade);

        base.OnModelCreating(modelBuilder);
    }
}
