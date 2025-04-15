type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  context?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * 简单的日志记录工具，方便后续集成到专业日志系统
 */
class Logger {
  private static instance: Logger;
  private isProduction = process.env.NODE_ENV === 'production';
  
  private constructor() {}
  
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
  
  /**
   * 记录日志
   */
  log(level: LogLevel, message: string, options: LogOptions = {}) {
    // 开发环境直接打印，生产环境可以考虑集成到专业的日志系统
    if (this.isProduction) {
      // 可以在这里集成到专业日志服务，如Sentry、LogRocket等
      // this.sendToLogService(level, message, options);
    }
    
    // 格式化日志
    const timestamp = new Date().toISOString();
    const context = options.context ? `[${options.context}]` : '';
    const userId = options.userId ? `[User: ${options.userId}]` : '';
    const metadata = options.metadata ? JSON.stringify(options.metadata) : '';
    
    const formattedLog = `${timestamp} ${level.toUpperCase()} ${context} ${userId} ${message} ${metadata}`;
    
    // 根据日志级别使用不同的控制台方法
    switch (level) {
      case 'debug':
        console.debug(formattedLog);
        break;
      case 'info':
        console.info(formattedLog);
        break;
      case 'warn':
        console.warn(formattedLog);
        break;
      case 'error':
        console.error(formattedLog);
        break;
    }
  }
  
  debug(message: string, options?: LogOptions) {
    this.log('debug', message, options);
  }
  
  info(message: string, options?: LogOptions) {
    this.log('info', message, options);
  }
  
  warn(message: string, options?: LogOptions) {
    this.log('warn', message, options);
  }
  
  error(message: string, options?: LogOptions) {
    this.log('error', message, options);
  }
}

export const logger = Logger.getInstance();
