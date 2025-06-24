using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace trivia_backend.Migrations
{
    /// <inheritdoc />
    public partial class SeedPreguntasData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Insertar 10 preguntas de trivia
            migrationBuilder.InsertData(
                table: "Preguntas",
                columns: new[] { "Id", "Texto", "Categoria", "Dificultad" },
                values: new object[,]
                {
                    { 1, "¿Cuál es la capital de Francia?", "Geografia", "Facil" },
                    { 2, "¿En qué año llegó el hombre a la Luna?", "Historia", "Medio" },
                    { 3, "¿Cuál es el elemento químico con símbolo 'O'?", "Ciencia", "Facil" },
                    { 4, "¿Quién escribió 'Don Quijote de la Mancha'?", "Literatura", "Medio" },
                    { 5, "¿Cuál es el planeta más grande del sistema solar?", "Ciencia", "Facil" },
                    { 6, "¿En qué país se encuentra Machu Picchu?", "Geografia", "Medio" },
                    { 7, "¿Cuál es la fórmula química del agua?", "Ciencia", "Facil" },
                    { 8, "¿Quién pintó 'La Gioconda'?", "Arte", "Medio" },
                    { 9, "¿Cuál es el océano más grande del mundo?", "Geografia", "Facil" },
                    { 10, "¿En qué año comenzó la Segunda Guerra Mundial?", "Historia", "Medio" }
                });

            // Insertar respuestas para cada pregunta (4 respuestas por pregunta = 40 respuestas)
            migrationBuilder.InsertData(
                table: "Respuestas",
                columns: new[] { "Id", "Texto", "EsCorrecta", "PreguntaId" },
                values: new object[,]
                {
                    // Pregunta 1: ¿Cuál es la capital de Francia?
                    { 1, "París", true, 1 },
                    { 2, "Londres", false, 1 },
                    { 3, "Madrid", false, 1 },
                    { 4, "Roma", false, 1 },

                    // Pregunta 2: ¿En qué año llegó el hombre a la Luna?
                    { 5, "1969", true, 2 },
                    { 6, "1968", false, 2 },
                    { 7, "1970", false, 2 },
                    { 8, "1971", false, 2 },

                    // Pregunta 3: ¿Cuál es el elemento químico con símbolo 'O'?
                    { 9, "Oxígeno", true, 3 },
                    { 10, "Oro", false, 3 },
                    { 11, "Osmio", false, 3 },
                    { 12, "Ozono", false, 3 },

                    // Pregunta 4: ¿Quién escribió 'Don Quijote de la Mancha'?
                    { 13, "Miguel de Cervantes", true, 4 },
                    { 14, "Federico García Lorca", false, 4 },
                    { 15, "Gabriel García Márquez", false, 4 },
                    { 16, "Pablo Neruda", false, 4 },

                    // Pregunta 5: ¿Cuál es el planeta más grande del sistema solar?
                    { 17, "Júpiter", true, 5 },
                    { 18, "Saturno", false, 5 },
                    { 19, "Neptuno", false, 5 },
                    { 20, "Urano", false, 5 },

                    // Pregunta 6: ¿En qué país se encuentra Machu Picchu?
                    { 21, "Perú", true, 6 },
                    { 22, "Bolivia", false, 6 },
                    { 23, "Ecuador", false, 6 },
                    { 24, "Colombia", false, 6 },

                    // Pregunta 7: ¿Cuál es la fórmula química del agua?
                    { 25, "H2O", true, 7 },
                    { 26, "CO2", false, 7 },
                    { 27, "H2SO4", false, 7 },
                    { 28, "NaCl", false, 7 },

                    // Pregunta 8: ¿Quién pintó 'La Gioconda'?
                    { 29, "Leonardo da Vinci", true, 8 },
                    { 30, "Miguel Ángel", false, 8 },
                    { 31, "Pablo Picasso", false, 8 },
                    { 32, "Vincent van Gogh", false, 8 },

                    // Pregunta 9: ¿Cuál es el océano más grande del mundo?
                    { 33, "Océano Pacífico", true, 9 },
                    { 34, "Océano Atlántico", false, 9 },
                    { 35, "Océano Índico", false, 9 },
                    { 36, "Océano Ártico", false, 9 },

                    // Pregunta 10: ¿En qué año comenzó la Segunda Guerra Mundial?
                    { 37, "1939", true, 10 },
                    { 38, "1940", false, 10 },
                    { 39, "1938", false, 10 },
                    { 40, "1941", false, 10 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Eliminar todas las respuestas
            migrationBuilder.DeleteData(
                table: "Respuestas",
                keyColumn: "Id",
                keyValues: new object[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40 });

            // Eliminar todas las preguntas
            migrationBuilder.DeleteData(
                table: "Preguntas",
                keyColumn: "Id",
                keyValues: new object[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 });
        }
    }
}
