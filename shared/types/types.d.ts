type LogType = 'info' | 'error';

type LogData = {
	message?: string;
	error?: Error;
} | Error;

type LogTitle = string;

export type Logger = {
	log: (logType: LogType, logData: LogData, logTitle: LogTitle, hiddenKeys: string[]) => void;
	clear: () => void;
	progress: (data: object) => void;
};
