import * as appInsights from 'applicationinsights';

// Define a type for custom properties to improve type safety
interface LogProperties {
  [key: string]: string | number | boolean | undefined;
}

class Logger {
  private appInsights: appInsights.TelemetryClient | null = null;

  constructor() {
    const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;

    if (!connectionString) {
      console.warn(
        '⚠️ Application Insights connection string is missing. Logging will only output to console.',
      );
      return;
    }

    try {
      appInsights.setup(connectionString).start();
      this.appInsights = appInsights.defaultClient;
      console.log('✅ Application Insights initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Application Insights:', error);
      this.appInsights = null; // Explicitly set to null on failure
    }
  }

  info(message: string, properties?: LogProperties): void {
    console.log(`[INFO] ${message}`, properties ? JSON.stringify(properties) : '');
    if (this.appInsights) {
      this.appInsights.trackTrace({
        message,
        properties,
      });
    }
  }

  error(message: string, error?: unknown): void {
    console.error(`[ERROR] ${message}`, error ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : '');
    if (this.appInsights) {
      if (error instanceof Error) {
        this.appInsights.trackException({ exception: error });
      } else {
        this.appInsights.trackTrace({
          message,
          properties: { error: JSON.stringify(error) },
        });
      }
    }
  }

  warn(message: string, properties?: LogProperties): void {
    console.warn(`[WARN] ${message}`, properties ? JSON.stringify(properties) : '');
    if (this.appInsights) {
      this.appInsights.trackTrace({
        message,
        properties,
      });
    }
  }

  trackEvent(name: string, properties?: LogProperties): void {
    console.log(`[EVENT] ${name}`, properties ? JSON.stringify(properties) : '');
    if (this.appInsights) {
      this.appInsights.trackEvent({ name, properties });
    }
  }

  // Optional: Flush telemetry data to ensure logs are sent before process exit
  flush(): void {
    if (this.appInsights) {
      this.appInsights.flush();
    }
  }
}

export const logger = new Logger();