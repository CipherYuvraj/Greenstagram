import * as appInsights from 'applicationinsights';
import logger from '../utils/logger';

let appInsightsInitialized = false;

// Define severity level enum to match Application Insights values
export enum LogSeverity {
  Verbose = 0,
  Information = 1,
  Warning = 2,
  Error = 3,
  Critical = 4
}

export const initializeAppInsights = () => {
  try {
    if (!process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
      logger.warn('Application Insights connection string not found. Telemetry will not be sent.');
      return false;
    }

    appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true)
      .setUseDiskRetryCaching(true)
      .setSendLiveMetrics(true)
      .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C);

    // Add Greenstagram-specific context
    appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.applicationVersion] = 
      process.env.npm_package_version || '1.0.0';
    appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = 
      'greenstagram-backend';
    
    // Start the client
    appInsights.start();
    
    logger.info('Application Insights initialized successfully');
    appInsightsInitialized = true;
    return true;
  } catch (error) {
    logger.error('Failed to initialize Application Insights:', error);
    return false;
  }
};

// Custom tracking functions
export const trackEvent = (name: string, properties?: {[key: string]: string}) => {
  if (appInsightsInitialized) {
    appInsights.defaultClient.trackEvent({name, properties});
  }
};

export const trackException = (exception: Error) => {
  if (appInsightsInitialized) {
    appInsights.defaultClient.trackException({exception});
  }
};

export const trackMetric = (name: string, value: number) => {
  if (appInsightsInitialized) {
    appInsights.defaultClient.trackMetric({name, value});
  }
};

/**
 * Track a trace with the specified severity level
 * @param message Message to track
 * @param severityLevel Severity level (0=Verbose, 1=Information, 2=Warning, 3=Error, 4=Critical)
 */
export const trackTrace = (message: string, _severityLevel: LogSeverity) => {
  if (appInsightsInitialized) {
    appInsights.defaultClient.trackTrace({
      message,
    });
  }
};

export const isConnected = () => {
  return appInsightsInitialized;
};

export default {
  initializeAppInsights,
  trackEvent,
  trackException,
  trackMetric,
  trackTrace,
  isConnected,
  LogSeverity
};

