using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace trivia_backend.Migrations
{
    /// <inheritdoc />
    public partial class ImproveSala : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Jugadores_Salas_SalaId",
                table: "Jugadores");

            migrationBuilder.DropForeignKey(
                name: "FK_Respuestas_Preguntas_PreguntaId",
                table: "Respuestas");

            migrationBuilder.AlterColumn<string>(
                name: "Descripcion",
                table: "Salas",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<int>(
                name: "CreadorId",
                table: "Salas",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "PreguntaId",
                table: "Respuestas",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Salas_CreadorId",
                table: "Salas",
                column: "CreadorId");

            migrationBuilder.AddForeignKey(
                name: "FK_Jugadores_Salas_SalaId",
                table: "Jugadores",
                column: "SalaId",
                principalTable: "Salas",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Respuestas_Preguntas_PreguntaId",
                table: "Respuestas",
                column: "PreguntaId",
                principalTable: "Preguntas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Salas_Jugadores_CreadorId",
                table: "Salas",
                column: "CreadorId",
                principalTable: "Jugadores",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Jugadores_Salas_SalaId",
                table: "Jugadores");

            migrationBuilder.DropForeignKey(
                name: "FK_Respuestas_Preguntas_PreguntaId",
                table: "Respuestas");

            migrationBuilder.DropForeignKey(
                name: "FK_Salas_Jugadores_CreadorId",
                table: "Salas");

            migrationBuilder.DropIndex(
                name: "IX_Salas_CreadorId",
                table: "Salas");

            migrationBuilder.DropColumn(
                name: "CreadorId",
                table: "Salas");

            migrationBuilder.AlterColumn<string>(
                name: "Descripcion",
                table: "Salas",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "PreguntaId",
                table: "Respuestas",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_Jugadores_Salas_SalaId",
                table: "Jugadores",
                column: "SalaId",
                principalTable: "Salas",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Respuestas_Preguntas_PreguntaId",
                table: "Respuestas",
                column: "PreguntaId",
                principalTable: "Preguntas",
                principalColumn: "Id");
        }
    }
}
