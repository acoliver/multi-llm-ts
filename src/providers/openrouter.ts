import { EngineCreateOpts, Model } from 'types/index'
import { LlmRole, LlmCompletionOpts } from 'types/llm'
import OpenAI from './openai'

//
// https://openrouter.ai/docs/quick-start
//

export default class extends OpenAI {

  _visionModels: string[] = []

  constructor(config: EngineCreateOpts) {
    super(config, {
      apiKey: config.apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
    })
    this.initVisionModels()
  }

  getName(): string {
    return 'openrouter'
  }

  async initVisionModels() {
    await this.getModels()
  }

  getVisionModels(): string[] {
    return this._visionModels
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  modelSupportsTools(model: string): boolean {
    return true
  }

  get systemRole(): LlmRole {
    return 'system'
  }

  async getModels(): Promise<Model[]> {
    const models = await super.getModels()
    this._visionModels = this.filterVisionModels(models)
    return models
  }    

  protected setBaseURL() {
    // avoid override by super
  }

  protected filterVisionModels(models: Model[]): string[] {
    return models.filter((model) => model.meta.architecture?.modality?.split('-')[0].includes('+image')).map((model) => model.id)
  }

  // override tool injection: include function-calling when plugins are registered
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getToolsOpts(_model: string, _opts?: LlmCompletionOpts) {
    if (!this.plugins.length) {
      return {} as any
    }
    const tools = await this.getAvailableTools()
    return tools.length ? { tools, tool_choice: 'auto' } : {}
  }

}
