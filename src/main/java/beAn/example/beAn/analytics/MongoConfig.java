package beAn.example.beAn.analytics;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
public class MongoConfig {

    @Value("${spring.data.mongodb.uri:${SPRING_DATA_MONGODB_URI:${MONGODB_URI:}}}")
    private String configuredUri;

    @Bean
    public MongoClient mongoClient() {
        String uri = configuredUri;

        // Fallback to environment variables directly if Spring property was empty or default
        if (uri == null || uri.isBlank() || uri.contains("localhost")) {
            String envUri = System.getenv("SPRING_DATA_MONGODB_URI");
            if (envUri != null && !envUri.isBlank()) {
                uri = envUri.trim();
            } else {
                String altEnv = System.getenv("MONGODB_URI");
                if (altEnv != null && !altEnv.isBlank()) {
                    uri = altEnv.trim();
                }
            }
        }

        boolean isRender = System.getenv("RENDER") != null || System.getenv("PORT") != null;

        // On Render / Cloud, if no external MongoDB URI is provided, do NOT try to connect to localhost
        if ((uri == null || uri.isBlank() || uri.contains("localhost")) && isRender) {
            System.out.println("[MongoConfig] Running on Render without external MongoDB URI. Set SPRING_DATA_MONGODB_URI in Render Environment.");
            return null;
        }

        if (uri == null || uri.isBlank()) {
            uri = "mongodb://localhost:27017/beandb";
        }

        try {
            System.out.println("[MongoConfig] Configuring MongoClient with 5s timeout...");
            MongoClientSettings settings = MongoClientSettings.builder()
                    .applyConnectionString(new ConnectionString(uri.trim()))
                    .applyToClusterSettings(b -> b.serverSelectionTimeout(5, TimeUnit.SECONDS))
                    .applyToSocketSettings(b -> b.connectTimeout(5, TimeUnit.SECONDS).readTimeout(5, TimeUnit.SECONDS))
                    .build();
            return MongoClients.create(settings);
        } catch (Exception e) {
            System.err.println("[MongoConfig] Failed to initialize MongoClient: " + e.getMessage());
            return null;
        }
    }
}
