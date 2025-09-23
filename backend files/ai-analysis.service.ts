import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  ProcessedFileData, 
  AIAnalysisResponse, 
  AIInsight,
  AIDataQuality,
  AITableAnalysis,
  AIRevenueAnalysis,
  AIVisualizationSuggestion,
  InsightType,
  FileType,
  AnalysisOptionsInput 
} from '../types/file-analysis';

export class AIAnalysisService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required for AI analysis');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  }

  async analyzeFile(
    fileData: ProcessedFileData, 
    fileType: FileType,
    options: AnalysisOptionsInput = {}
  ): Promise<AIAnalysisResponse> {
    const startTime = Date.now();
    
    try {
      // Build comprehensive analysis prompt
      const prompt = this.buildAnalysisPrompt(fileData, fileType, options);
      
      // Get AI analysis
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Parse AI response
      const aiResponse = this.parseAIResponse(responseText);
      
      // Add execution metadata
      aiResponse.metadata = {
        ...aiResponse.metadata,
        executionTime: Date.now() - startTime,
        fileType,
        analysisOptions: options,
        promptLength: prompt.length,
        responseLength: responseText.length,
      };

      return aiResponse;
    } catch (error) {
      console.error('AI Analysis failed:', error);
      throw new Error(`AI Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildAnalysisPrompt(
    fileData: ProcessedFileData, 
    fileType: FileType,
    options: AnalysisOptionsInput
  ): string {
    let prompt = `Analyze the following ${fileType} file data and provide comprehensive insights.

IMPORTANT: Return your response as a valid JSON object with the following structure:
{
  "insights": [
    {
      "type": "INSIGHT_TYPE",
      "title": "Insight Title",
      "description": "Detailed description",
      "value": "specific value or metric",
      "confidence": 0.95,
      "importance": 8,
      "evidence": ["supporting evidence"]
    }
  ],
  "summary": "Overall file analysis summary",
  "dataQuality": {
    "overallScore": 0.85,
    "completeness": 0.90,
    "accuracy": 0.85,
    "consistency": 0.80,
    "validity": 0.88,
    "issues": [
      {
        "type": "missing_values",
        "description": "Some columns have missing values",
        "severity": "MEDIUM",
        "affectedColumns": ["column1", "column2"],
        "sampleValues": ["", "null", "N/A"],
        "suggestions": ["Fill missing values", "Remove incomplete records"]
      }
    ]
  },
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "visualizations": [
    {
      "type": "BAR",
      "title": "Chart Title",
      "description": "Chart description",
      "xAxis": "category",
      "yAxis": "value",
      "data": {"labels": ["A", "B"], "values": [10, 20]},
      "priority": 9
    }
  ],
  "metadata": {}
}

File Content:
${this.truncateContent(fileData.content, 10000)}
`;

    // Add structured data analysis
    if (fileData.structured) {
      prompt += `\n\nStructured Data:
${JSON.stringify(fileData.structured, null, 2).substring(0, 5000)}`;
    }

    // Add table analysis
    if (fileData.tables && fileData.tables.length > 0) {
      prompt += `\n\nTables Found:`;
      fileData.tables.forEach((table, index) => {
        prompt += `\n\nTable ${index + 1}${table.name ? ` (${table.name})` : ''}:
- Rows: ${table.rowCount}
- Columns: ${table.columnCount}
- Headers: ${table.headers.join(', ')}
- Sample data: ${JSON.stringify(table.rows.slice(0, 3))}`;
      });
    }

    // Add specific analysis instructions based on options
    if (options.analyzeRevenue) {
      prompt += `\n\nRevenue Analysis Required:
- Look for revenue, sales, income, earnings, profit columns
- Calculate totals, averages, trends over time
- Identify growth patterns and seasonal variations
- Provide forecasts if time series data is available
- Segment revenue by categories if applicable`;
    }

    if (options.analyzeTables) {
      prompt += `\n\nTable Structure Analysis Required:
- Analyze each table's purpose and business meaning
- Identify data types, constraints, and relationships
- Check for primary keys, foreign keys, and indexes
- Suggest optimizations and improvements
- Identify potential data modeling issues`;
    }

    if (options.checkDataQuality) {
      prompt += `\n\nData Quality Analysis Required:
- Check for missing values, duplicates, inconsistencies
- Validate data formats and patterns
- Identify outliers and anomalies
- Assess completeness and accuracy
- Provide data quality score (0-1)`;
    }

    if (options.generateVisualizations) {
      prompt += `\n\nVisualization Suggestions Required:
- Suggest appropriate chart types for the data
- Identify key metrics that should be visualized
- Recommend dashboard layouts
- Consider user experience and insights clarity`;
    }

    if (options.customPrompts && options.customPrompts.length > 0) {
      prompt += `\n\nCustom Analysis Requirements:
${options.customPrompts.join('\n')}`;
    }

    // Add file type specific instructions
    switch (fileType) {
      case FileType.SQL:
        prompt += `\n\nSQL-Specific Analysis:
- Analyze query performance and optimization opportunities
- Check for security vulnerabilities (SQL injection risks)
- Identify complex joins and suggest improvements
- Analyze data model relationships
- Check for best practices compliance`;
        break;

      case FileType.CSV:
      case FileType.EXCEL:
        prompt += `\n\nData File Analysis:
- Perform statistical analysis on numeric columns
- Identify data patterns and correlations
- Check for data integrity issues
- Suggest data cleaning steps
- Identify business insights from the data`;
        break;

      case FileType.PDF:
        prompt += `\n\nDocument Analysis:
- Extract key business metrics and KPIs
- Identify tables, charts, and structured data
- Summarize main findings and insights
- Extract action items and recommendations`;
        break;
    }

    prompt += `\n\nIMPORTANT REMINDERS:
1. Return ONLY a valid JSON object, no markdown formatting
2. Be specific and actionable in your insights
3. Provide confidence scores based on data quality and analysis certainty
4. Prioritize insights by business impact and actionability
5. Include specific evidence to support your findings
6. Generate realistic visualization suggestions with actual data structure
7. Ensure all numeric values are valid numbers, not strings`;

    return prompt;
  }

  private parseAIResponse(responseText: string): AIAnalysisResponse {
    try {
      // Clean the response - remove markdown formatting if present
      let cleanedResponse = responseText.trim();
      
      // Remove markdown code blocks
      cleanedResponse = cleanedResponse.replace(/^```json\s*/i, '');
      cleanedResponse = cleanedResponse.replace(/```\s*$/, '');
      cleanedResponse = cleanedResponse.trim();

      // Parse JSON
      const parsed = JSON.parse(cleanedResponse);

      // Validate and transform the response
      const response: AIAnalysisResponse = {
        insights: this.validateInsights(parsed.insights || []),
        summary: parsed.summary || 'No summary provided',
        dataQuality: parsed.dataQuality,
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        tables: parsed.tables,
        revenue: parsed.revenue,
        visualizations: this.validateVisualizations(parsed.visualizations || []),
        metadata: parsed.metadata || {},
      };

      return response;
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.error('Raw response:', responseText);
      
      // Return fallback response
      return {
        insights: [{
          type: InsightType.SUMMARY,
          title: 'Analysis Completed',
          description: 'File analysis was completed but response parsing failed.',
          confidence: 0.5,
          importance: 5,
          evidence: ['AI analysis completed'],
        }],
        summary: 'File analysis completed with parsing issues. Raw analysis available in metadata.',
        recommendations: ['Review file content manually', 'Check data format and structure'],
        visualizations: [],
        metadata: {
          parseError: true,
          rawResponse: responseText.substring(0, 1000),
        },
      };
    }
  }

  private validateInsights(insights: any[]): AIInsight[] {
    return insights.map((insight, index) => ({
      type: this.validateInsightType(insight.type),
      title: insight.title || `Insight ${index + 1}`,
      description: insight.description || 'No description provided',
      value: insight.value,
      confidence: this.validateConfidence(insight.confidence),
      importance: this.validateImportance(insight.importance),
      evidence: Array.isArray(insight.evidence) ? insight.evidence : [],
    }));
  }

  private validateVisualizations(visualizations: any[]): AIVisualizationSuggestion[] {
    return visualizations.map((viz, index) => ({
      type: viz.type || 'BAR',
      title: viz.title || `Visualization ${index + 1}`,
      description: viz.description || '',
      xAxis: viz.xAxis,
      yAxis: viz.yAxis,
      data: viz.data || {},
      priority: this.validatePriority(viz.priority),
    }));
  }

  private validateInsightType(type: string): InsightType {
    if (Object.values(InsightType).includes(type as InsightType)) {
      return type as InsightType;
    }
    return InsightType.SUMMARY;
  }

  private validateConfidence(confidence: any): number {
    const num = parseFloat(confidence);
    if (isNaN(num)) return 0.5;
    return Math.max(0, Math.min(1, num));
  }

  private validateImportance(importance: any): number {
    const num = parseInt(importance);
    if (isNaN(num)) return 5;
    return Math.max(1, Math.min(10, num));
  }

  private validatePriority(priority: any): number {
    const num = parseInt(priority);
    if (isNaN(num)) return 5;
    return Math.max(1, Math.min(10, num));
  }

  private truncateContent(content: string, maxLength: number): string {
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength) + '\n\n[Content truncated...]';
  }

  async generateCustomAnalysis(fileData: ProcessedFileData, customPrompts: string[]): Promise<AIAnalysisResponse> {
    const prompt = `Analyze the following file data based on these specific requirements:

${customPrompts.map((p, i) => `${i + 1}. ${p}`).join('\n')}

File Content:
${this.truncateContent(fileData.content, 8000)}

${fileData.structured ? `\nStructured Data:\n${JSON.stringify(fileData.structured, null, 2).substring(0, 3000)}` : ''}

Return your analysis as a JSON object with insights, summary, and recommendations.
Focus specifically on the requirements listed above.`;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      return this.parseAIResponse(responseText);
    } catch (error) {
      throw new Error(`Custom analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateBusinessInsights(fileData: ProcessedFileData, businessContext?: string): Promise<AIInsight[]> {
    const prompt = `Generate specific business insights from this data:

${businessContext ? `Business Context: ${businessContext}\n\n` : ''}

Data:
${this.truncateContent(fileData.content, 6000)}

Focus on:
1. Business KPIs and metrics
2. Operational efficiency opportunities
3. Revenue optimization suggestions
4. Cost reduction opportunities
5. Risk factors and mitigation strategies
6. Growth opportunities
7. Customer behavior patterns (if applicable)
8. Market trends and implications

Return a JSON array of insights with type, title, description, confidence, and business impact.`;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      const parsed = JSON.parse(responseText.replace(/^```json\s*/i, '').replace(/```\s*$/, ''));
      return this.validateInsights(parsed);
    } catch (error) {
      console.error('Business insights generation failed:', error);
      return [];
    }
  }

  async generateDataQualityReport(fileData: ProcessedFileData): Promise<AIDataQuality> {
    const prompt = `Perform a comprehensive data quality analysis on this dataset:

Data:
${this.truncateContent(fileData.content, 8000)}

Analyze:
1. Completeness - missing values, empty fields
2. Accuracy - data format correctness, valid ranges
3. Consistency - uniform formatting, standardized values
4. Validity - business rule compliance, referential integrity
5. Uniqueness - duplicate records, primary key violations

Return a JSON object with:
{
  "overallScore": 0.85,
  "completeness": 0.90,
  "accuracy": 0.85,
  "consistency": 0.80,
  "validity": 0.88,
  "issues": [
    {
      "type": "missing_values",
      "description": "Description of the issue",
      "severity": "HIGH|MEDIUM|LOW|CRITICAL",
      "affectedColumns": ["column1"],
      "sampleValues": ["example1", "example2"],
      "suggestions": ["suggestion1", "suggestion2"]
    }
  ]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      const parsed = JSON.parse(responseText.replace(/^```json\s*/i, '').replace(/```\s*$/, ''));
      return parsed;
    } catch (error) {
      console.error('Data quality analysis failed:', error);
      return {
        overallScore: 0.5,
        completeness: 0.5,
        accuracy: 0.5,
        consistency: 0.5,
        validity: 0.5,
        issues: [{
          type: 'analysis_error',
          description: 'Data quality analysis could not be completed',
          severity: 'MEDIUM',
          affectedColumns: [],
          sampleValues: [],
          suggestions: ['Review data manually', 'Check file format'],
        }],
      };
    }
  }

  async generateRevenueAnalysis(fileData: ProcessedFileData): Promise<AIRevenueAnalysis | null> {
    // Look for revenue-related columns
    const revenueKeywords = ['revenue', 'sales', 'income', 'earnings', 'profit', 'amount', 'price', 'total'];
    const hasRevenueData = fileData.content.toLowerCase().split('\n').some(line => 
      revenueKeywords.some(keyword => line.includes(keyword))
    );

    if (!hasRevenueData) {
      return null;
    }

    const prompt = `Analyze revenue and financial data from this dataset:

Data:
${this.truncateContent(fileData.content, 8000)}

Provide comprehensive revenue analysis including:
1. Total revenue calculations
2. Time-based trends (if dates available)
3. Revenue segmentation by categories
4. Growth rates and patterns
5. Seasonal variations
6. Forecasts (if sufficient historical data)
7. Key performance indicators

Return a JSON object with revenue analysis results.`;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      const parsed = JSON.parse(responseText.replace(/^```json\s*/i, '').replace(/```\s*$/, ''));
      return parsed;
    } catch (error) {
      console.error('Revenue analysis failed:', error);
      return null;
    }
  }
}