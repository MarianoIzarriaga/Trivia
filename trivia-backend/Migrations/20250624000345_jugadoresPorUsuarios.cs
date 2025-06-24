using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace trivia_backend.Migrations
{
    /// <inheritdoc />
    public partial class jugadoresPorUsuarios : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Usuarios_Salas_SalaId",
                table: "Usuarios");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Usuarios",
                table: "Usuarios");

            migrationBuilder.RenameTable(
                name: "Usuarios",
                newName: "Jugadores");

            migrationBuilder.RenameIndex(
                name: "IX_Usuarios_SalaId",
                table: "Jugadores",
                newName: "IX_Jugadores_SalaId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Jugadores",
                table: "Jugadores",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Jugadores_Salas_SalaId",
                table: "Jugadores",
                column: "SalaId",
                principalTable: "Salas",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Jugadores_Salas_SalaId",
                table: "Jugadores");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Jugadores",
                table: "Jugadores");

            migrationBuilder.RenameTable(
                name: "Jugadores",
                newName: "Usuarios");

            migrationBuilder.RenameIndex(
                name: "IX_Jugadores_SalaId",
                table: "Usuarios",
                newName: "IX_Usuarios_SalaId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Usuarios",
                table: "Usuarios",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Usuarios_Salas_SalaId",
                table: "Usuarios",
                column: "SalaId",
                principalTable: "Salas",
                principalColumn: "Id");
        }
    }
}
