import { 
  FileUploadInput,
  AnalysisOptionsInput,
  ReportExportInput,
  FileUpload,
  AnalysisReport,
  Insight,
  ReportExport,
  InsightType,
  ReportFormat,
  AnalysisStatus
} from '../types/file-analysis';
import { FileUploadService } from '../services/file-upload.service';
import { ReportGenerationService } from '../services/report-generation.service';
import { GraphQLScalarType, GraphQLError } from 'graphql';

export class FileAnalysisResolvers {
  private fileUploadService: FileUploadService;
  private reportGenerationService: ReportGenerationService;
  
  // Custom Upload scalar
  private Upload = new GraphQLScalarType({
    name: 'Upload',
    description: 'The `Upload` scalar type represents a file upload.',
    serialize: (value: any) => value,
    parseValue: (value: any) => value,
    parseLiteral: () => {
      throw new GraphQLError('Upload literal unsupported.', { extensions: { code: 'GRAPHQL_VALIDATION_FAILED' } });
    },
  });
  
  // Mock in-memory storage (replace with actual database)
  private mockFileUploads: Map<string, FileUpload> = new Map();
  private mockReports: Map<string, AnalysisReport> = new Map();
  private mockInsights: Map<string, Insight> = new Map();

  constructor() {
    this.fileUploadService = new FileUploadService();
    this.reportGenerationService = new ReportGenerationService();
  }

  getResolvers() {
    return {
      Upload: this.Upload,
      
      Query: {
        getFileUpload: async (_: any, { id }: { id: string }) => {
          return this.mockFileUploads.get(id) || null;
        },

        listFileUploads: async (_: any, { limit = 20, offset = 0 }: { limit?: number; offset?: number }) => {
          const uploads = Array.from(this.mockFileUploads.values())
            .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
            .slice(offset, offset + limit);
          return uploads;
        },

        getAnalysisReport: async (_: any, { id }: { id: string }) => {
          return this.mockReports.get(id) || null;
        },

        getAnalysisReportByFileId: async (_: any, { fileId }: { fileId: string }) => {
          const report = Array.from(this.mockReports.values())
            .find(r => r.fileUploadId === fileId);
          return report || null;
        },

        listAnalysisReports: async (_: any, { limit = 20, offset = 0 }: { limit?: number; offset?: number }) => {
          const reports = Array.from(this.mockReports.values())
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(offset, offset + limit);
          return reports;
        },

        getInsight: async (_: any, { id }: { id: string }) => {
          return this.mockInsights.get(id) || null;
        },

        getInsightsByReport: async (_: any, { reportId }: { reportId: string }) => {
          return Array.from(this.mockInsights.values())
            .filter(insight => insight.reportId === reportId)
            .sort((a, b) => b.importance - a.importance);
        },

        getInsightsByType: async (_: any, { type, limit = 10 }: { type: InsightType; limit?: number }) => {
          return Array.from(this.mockInsights.values())
            .filter(insight => insight.type === type)
            .sort((a, b) => b.importance - a.importance)
            .slice(0, limit);
        },

        searchReports: async (_: any, { query, limit = 10 }: { query: string; limit?: number }) => {
          const searchTerm = query.toLowerCase();
          return Array.from(this.mockReports.values())
            .filter(report => 
              report.title.toLowerCase().includes(searchTerm) ||
              report.summary.toLowerCase().includes(searchTerm) ||
              report.fileUpload.originalName.toLowerCase().includes(searchTerm)
            )
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, limit);
        },

        getReportsByDateRange: async (_: any, { startDate, endDate }: { startDate: Date; endDate: Date }) => {
          return Array.from(this.mockReports.values())
            .filter(report => 
              report.createdAt >= startDate && report.createdAt <= endDate
            )
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        },

        getReportsByFileType: async (_: any, { fileType }: { fileType: string }) => {
          return Array.from(this.mockReports.values())
            .filter(report => report.fileUpload.fileType === fileType)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        },
      },

      Mutation: {
        uploadAndAnalyzeFile: async (_: any, { input }: { input: FileUploadInput }) => {
          try {
            console.log('Starting file upload and analysis...');
            console.log('Input received:', JSON.stringify(input, null, 2));
            
            // Validate file input
            if (!input.file) {
              throw new Error('No file provided');
            }
            
            // Check if file has the expected structure from multer
            const file = input.file as any;
            if (!file.buffer && !file.filename) {
              throw new Error('Invalid file format received');
            }
            
            console.log('File details:', {
              filename: file.filename,
              mimetype: file.mimetype,
              size: file.size
            });

            // Upload file
            const fileUpload = await this.fileUploadService.uploadFile(
              input.file,
              input.description,
              input.tags
            );

            // Store file upload
            this.mockFileUploads.set(fileUpload.id, fileUpload);
            console.log(`File uploaded: ${fileUpload.id}`);

            // Generate analysis report
            const report = await this.reportGenerationService.generateAnalysisReport(
              fileUpload,
              input.analysisOptions || {}
            );

            // Store report and insights
            this.mockReports.set(report.id, report);
            report.insights.forEach(insight => {
              this.mockInsights.set(insight.id, insight);
            });

            console.log(`Analysis completed: ${report.id}`);
            return report;
          } catch (error) {
            console.error('Upload and analysis failed:', error);
            throw new Error(`Upload and analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        },

        reanalyzeFile: async (_: any, { fileId, options }: { fileId: string; options?: AnalysisOptionsInput }) => {
          const fileUpload = this.mockFileUploads.get(fileId);
          if (!fileUpload) {
            throw new Error('File not found');
          }

          // Generate new analysis report
          const report = await this.reportGenerationService.generateAnalysisReport(
            fileUpload,
            options || {}
          );

          // Update stored data
          this.mockReports.set(report.id, report);
          report.insights.forEach(insight => {
            this.mockInsights.set(insight.id, insight);
          });

          return report;
        },

        generateCustomAnalysis: async (_: any, { fileId, prompts }: { fileId: string; prompts: string[] }) => {
          const fileUpload = this.mockFileUploads.get(fileId);
          if (!fileUpload) {
            throw new Error('File not found');
          }

          // Process file and generate custom analysis
          const fileData = await this.fileUploadService.processFile(fileUpload);
          
          // For custom analysis, we'll create a simplified report
          const report = await this.reportGenerationService.generateAnalysisReport(
            fileUpload,
            { customPrompts: prompts }
          );

          // Update stored data
          this.mockReports.set(report.id, report);
          report.insights.forEach(insight => {
            this.mockInsights.set(insight.id, insight);
          });

          return report;
        },

        updateReportTitle: async (_: any, { reportId, title }: { reportId: string; title: string }) => {
          const report = this.mockReports.get(reportId);
          if (!report) {
            throw new Error('Report not found');
          }

          report.title = title;
          report.updatedAt = new Date();
          this.mockReports.set(reportId, report);

          return report;
        },

        addCustomInsight: async (_: any, { reportId, insight }: { reportId: string; insight: string }) => {
          const report = this.mockReports.get(reportId);
          if (!report) {
            throw new Error('Report not found');
          }

          const newInsight = await this.reportGenerationService.addCustomInsight(reportId, insight);
          
          // Update stored data
          this.mockInsights.set(newInsight.id, newInsight);
          report.insights.push(newInsight);
          report.updatedAt = new Date();
          this.mockReports.set(reportId, report);

          return newInsight;
        },

        deleteReport: async (_: any, { reportId }: { reportId: string }) => {
          const report = this.mockReports.get(reportId);
          if (!report) {
            return false;
          }

          // Delete associated insights
          report.insights.forEach(insight => {
            this.mockInsights.delete(insight.id);
          });

          // Delete report
          this.mockReports.delete(reportId);
          return true;
        },

        exportReport: async (_: any, { input }: { input: ReportExportInput }) => {
          const report = this.mockReports.get(input.reportId);
          if (!report) {
            throw new Error('Report not found');
          }

          const exportResult = await this.reportGenerationService.exportReport(report, input.format);
          return exportResult;
        },

        deleteFileUpload: async (_: any, { id }: { id: string }) => {
          const fileUpload = this.mockFileUploads.get(id);
          if (!fileUpload) {
            return false;
          }

          // Delete associated reports and insights
          const associatedReports = Array.from(this.mockReports.values())
            .filter(report => report.fileUploadId === id);
          
          associatedReports.forEach(report => {
            report.insights.forEach(insight => {
              this.mockInsights.delete(insight.id);
            });
            this.mockReports.delete(report.id);
          });

          // Delete file from filesystem
          await this.fileUploadService.deleteFile(fileUpload);

          // Delete file upload record
          this.mockFileUploads.delete(id);
          return true;
        },

        updateFileMetadata: async (_: any, { id, metadata }: { id: string; metadata: Record<string, any> }) => {
          const fileUpload = this.mockFileUploads.get(id);
          if (!fileUpload) {
            throw new Error('File upload not found');
          }

          fileUpload.metadata = { ...fileUpload.metadata, ...metadata };
          this.mockFileUploads.set(id, fileUpload);

          return fileUpload;
        },
      },

      // Type resolvers
      AnalysisReport: {
        fileUpload: (parent: AnalysisReport) => {
          return this.mockFileUploads.get(parent.fileUploadId);
        },
        insights: (parent: AnalysisReport) => {
          return parent.insights.sort((a, b) => b.importance - a.importance);
        },
      },

      FileUpload: {
        analysisReport: (parent: FileUpload) => {
          return Array.from(this.mockReports.values())
            .find(report => report.fileUploadId === parent.id) || null;
        },
      },

      // Note: Subscription resolvers commented out for now - requires proper pub/sub implementation
      // Subscription: {
      //   analysisProgress: {
      //     subscribe: async function* (_, { reportId }: { reportId: string }) {
      //       // Implementation would use Redis pub/sub or similar
      //     },
      //   },
      // },
    };
  }

  // Helper methods for testing
  addMockData() {
    // Add some mock data for testing
    const mockFile: FileUpload = {
      id: 'mock-file-1',
      filename: 'sample_data.csv',
      originalName: 'sample_data.csv',
      mimetype: 'text/csv',
      encoding: '7bit',
      size: 1024,
      path: '/uploads/mock-file-1.csv',
      fileType: 'CSV' as any,
      uploadedAt: new Date(),
      metadata: {
        description: 'Sample CSV file for testing',
        tags: ['sample', 'test'],
      },
    };

    this.mockFileUploads.set(mockFile.id, mockFile);

    const mockReport: AnalysisReport = {
      id: 'mock-report-1',
      fileUploadId: mockFile.id,
      fileUpload: mockFile,
      status: AnalysisStatus.COMPLETED,
      title: 'Sample Data Analysis',
      summary: 'Analysis of sample CSV data showing revenue trends and data quality metrics.',
      executionTime: 5000,
      insights: [],
      recommendations: [
        'Consider standardizing date formats',
        'Remove duplicate entries',
        'Add data validation rules',
      ],
      visualizations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.mockReports.set(mockReport.id, mockReport);
  }

  clearMockData() {
    this.mockFileUploads.clear();
    this.mockReports.clear();
    this.mockInsights.clear();
  }
}

// Create and export instance for use in GraphQL resolvers
const fileAnalysisResolversInstance = new FileAnalysisResolvers();

export const fileAnalysisResolvers = fileAnalysisResolversInstance.getResolvers();