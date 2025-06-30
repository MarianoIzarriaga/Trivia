using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace trivia_backend.Migrations
{
    /// <inheritdoc />
    public partial class AddResultadoJuego : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ResultadosJuego",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SalaId = table.Column<int>(type: "int", nullable: false),
                    Ganador = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PuntuacionesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FechaFinalizacion = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResultadosJuego", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ResultadosJuego");
        }
    }
}
