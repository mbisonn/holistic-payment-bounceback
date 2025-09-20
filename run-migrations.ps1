# Database connection parameters
$dbHost = "db.ytqruetuadthefyclmiq.supabase.co"
$dbPort = "5432"
$dbName = "postgres"
$dbUser = "postgres"
$dbPassword = "@Lynxxx_007"  # Replace with your actual password

# Path to migrations
$migrationsPath = "$PSScriptRoot\supabase\migrations"

# Get all migration files in order
$migrationFiles = Get-ChildItem -Path $migrationsPath -Filter "*.sql" | Sort-Object Name

# Connection string
$connectionString = "host=$dbHost port=$dbPort dbname=$dbName user=$dbUser password=$dbPassword sslmode=require"

# Install Npgsql if not already installed
if (-not (Get-Module -Name Npgsql -ListAvailable)) {
    Install-Module -Name Npgsql -Force -Scope CurrentUser -AllowClobber -Confirm:$false
}

# Import Npgsql
Import-Module Npgsql

# Create connection
$connection = New-Object Npgsql.NpgsqlConnection($connectionString)

try {
    # Open connection
    $connection.Open()
    Write-Host "Connected to database successfully" -ForegroundColor Green

    # Run each migration
    foreach ($file in $migrationFiles) {
        Write-Host "Running migration: $($file.Name)" -ForegroundColor Cyan
        $sql = Get-Content -Path $file.FullName -Raw
        
        $command = $connection.CreateCommand()
        $command.CommandText = $sql
        
        try {
            $command.ExecuteNonQuery() | Out-Null
            Write-Host "  ✓ Success" -ForegroundColor Green
        }
        catch {
            Write-Host "  ✗ Error: $_" -ForegroundColor Red
            throw $_.Exception
        }
    }
}
catch {
    Write-Host "Error: $_" -ForegroundColor Red
    throw $_.Exception
}
finally {
    # Close connection
    if ($connection.State -eq [System.Data.ConnectionState]::Open) {
        $connection.Close()
    }
    Write-Host "Disconnected from database." -ForegroundColor Yellow
}
