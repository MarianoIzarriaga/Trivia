# Usar la imagen base de .NET 8.0 SDK para build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copiar el archivo de proyecto y restaurar dependencias
COPY *.csproj ./
RUN dotnet restore

# Copiar el resto del código fuente
COPY . ./

# Publicar la aplicación
RUN dotnet publish -c Release -o out

# Usar la imagen base de .NET 8.0 runtime para ejecución
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copiar los archivos publicados desde la etapa de build
COPY --from=build /app/out .

# Exponer el puerto
EXPOSE 5000

# Comando para ejecutar la aplicación
ENTRYPOINT ["dotnet", "trivia-backend.dll"]
