// AI Provider Interface scaffold
export interface AIProvider {
  summarizeCheckIns(checkIns: any[]): Promise<string>
  draftContract(details: any): Promise<string>
  generateReport(data: any): Promise<string>
}

// Default No-op Provider
export class MockAIProvider implements AIProvider {
  async summarizeCheckIns(checkIns: any[]): Promise<string> {
    return "AI Feature Not Yet Implemented."
  }
  async draftContract(details: any): Promise<string> {
    return "AI Feature Not Yet Implemented."
  }
  async generateReport(data: any): Promise<string> {
    return "AI Feature Not Yet Implemented."
  }
}

// Factory to inject real AI later (OpenAI, Gemini, OpenRouter)
export const aiService: AIProvider = new MockAIProvider()
