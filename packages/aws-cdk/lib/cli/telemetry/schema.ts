interface Identifiers {
  readonly cdkCliVersion: string;
  readonly cdkLibraryVersion?: string;
  readonly telemetryVersion: string;
  readonly sessionId: string;
  readonly eventId: string;
  readonly installationId: string;
  readonly timestamp: string;
  readonly accountId?: string;
  readonly region?: string;
}

interface Event {
  readonly state: 'ABORTED' | 'FAILED' | 'SUCCEEDED';
  readonly eventType: string;
  readonly command: {
    readonly path: string[];
    readonly parameters: string[];
    readonly config: { [key: string]: any };
  };
}

interface Environment {
  readonly os: {
    readonly platform: string;
    readonly release: string;
  };
  readonly ci: boolean;
  readonly nodeVersion: string;
}

interface Duration {
  readonly total: number;
  readonly components?: { [key: string]: number };
}

type Counters = { [key: string]: number };

interface Error {
  readonly name: string;
  readonly message?: string; // anonymized stack message
  readonly trace?: string; // anonymized stack trace
  readonly logs?: string; // anonymized stack logs
}

interface Dependency {
  readonly name: string;
  readonly version: string;
}

interface Project {
  readonly dependencies?: Dependency[];
}

export interface TelemetrySchema {
  readonly identifiers: Identifiers;
  readonly event: Event;
  readonly environment: Environment;
  readonly project: Project;
  readonly duration: Duration;
  readonly counters?: Counters;
  readonly error?: Error;
}
