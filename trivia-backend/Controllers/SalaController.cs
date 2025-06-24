using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using trivia_backend.Models;

namespace trivia_backend.Controllers;

public class SalaController : Controller
{
    private readonly AppDbContext _db;
    public SalaController(AppDbContext db) => _db = db;


    /*
        * crear sala
        * unirse a sala con un codigo
        * salir de la sala
    
    */

    [HttpPost]
    public IActionResult CrearSala(string nombreJugador)
    {
        //crear el codigo sala
        string codigoSala = "ABC1234";



        return Ok("Sala creada exitosamente.");
    }

    public IActionResult UnirseSala(string codigoSala)
    {
        if (string.IsNullOrEmpty(codigoSala))
        {
            return BadRequest("El código de sala no puede estar vacío.");
        }

        // Lógica para unirse a la sala con el código proporcionado
        return Ok($"Unido a la sala con código: {codigoSala}");
    }

    public IActionResult SalirDeSala(string nombreJugador)
    {
        return Ok("asd");
    }

    public IActionResult Index()
    {
        return View();
    }

}
