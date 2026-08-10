import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class CleanDB {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:postgresql://ep-calm-sky-az2uy53g-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
        String user = "neondb_owner";
        String password = "npg_kt3yHwMW7RQi";
        
        System.out.println("Connecting to database...");
        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            System.out.println("Dropping schema public...");
            stmt.execute("DROP SCHEMA public CASCADE;");
            System.out.println("Creating schema public...");
            stmt.execute("CREATE SCHEMA public;");
            System.out.println("Done! Database is clean.");
        }
    }
}
