import type {
  RESTPostAPIInteractionCallbackJSONBody as CallbackPayloadSneak,
  RESTPostAPIWebhookWithTokenJSONBody as ExecutePayloadSneak,
  RESTPostAPIWebhookWithTokenWaitResult as ExecuteWaitResponseSneak,
  RESTGetAPIWebhookWithTokenMessageResult as FetchResponseSneak,
  RESTPatchAPIWebhookWithTokenMessageJSONBody as UpdatePayloadSneak,
  RESTPatchAPIWebhookWithTokenMessageResult as UpdateResponseSneak,
} from 'discord-api-types/v9'
import type { DiscordToken } from './internal/common.js'
import type { CamelCase } from '../util/case.js'
import { route, executeQuery } from './internal/common.js'

export type Interaction = { id: string, token: string }
export type InteractionCredentials = { applicationId: string, interactionToken: string }

type CallbackPayload = CamelCase<CallbackPayloadSneak>
type CreatePayload = CamelCase<ExecutePayloadSneak>
type CreateResponse = CamelCase<ExecuteWaitResponseSneak>
type FetchResponse = CamelCase<FetchResponseSneak>
type UpdatePayload = CamelCase<UpdatePayloadSneak>
type UpdateResponse = CamelCase<UpdateResponseSneak>

const CREATE_RESPONSE = route`${'POST'}/interactions/${'interactionId'}/${'interactionToken'}/callback`

const CREATE_MESSAGE = route`${'POST'}/webhooks/${'webhookId'}/${'webhookToken'}`
const FETCH_MESSAGE = route`${'GET'}/webhooks/${'webhookId'}/${'webhookToken'}/messages/${'messageId'}`
const UPDATE_MESSAGE = route`${'PATCH'}/webhooks/${'webhookId'}/${'webhookToken'}/messages/${'messageId'}`
const DELETE_MESSAGE = route`${'DELETE'}/webhooks/${'webhookId'}/${'webhookToken'}/messages/${'messageId'}`

// Create Interaction Response
export async function createResponse (interaction: Interaction, response: CallbackPayload, token: DiscordToken): Promise<void> {
  return executeQuery({
    route: CREATE_RESPONSE({ interactionId: interaction.id, interactionToken: interaction.token }),
    body: response,
    token: token,
  })
}

// Create Interaction Message
export async function createMessage (interaction: InteractionCredentials, message: CreatePayload, token: DiscordToken): Promise<CreateResponse> {
  return executeQuery({
    route: CREATE_MESSAGE({ webhookId: interaction.applicationId, webhookToken: interaction.interactionToken }),
    body: message,
    token: token,
  })
}

// Get Original Interaction Message
export async function fetchMessage (interaction: InteractionCredentials, messageId: string, token: DiscordToken): Promise<FetchResponse> {
  return executeQuery({
    route: FETCH_MESSAGE({ webhookId: interaction.applicationId, webhookToken: interaction.interactionToken, messageId: messageId }),
    token: token,
  })
}

// Edit Original Interaction Message
export async function updateMessage (interaction: InteractionCredentials, messageId: string, message: UpdatePayload, token: DiscordToken): Promise<UpdateResponse> {
  return executeQuery({
    route: UPDATE_MESSAGE({ webhookId: interaction.applicationId, webhookToken: interaction.interactionToken, messageId: messageId }),
    body: message,
    token: token,
  })
}

// Delete Original Interaction Message
export async function deleteMessage (interaction: InteractionCredentials, messageId: string, token: DiscordToken): Promise<void> {
  return executeQuery({
    route: DELETE_MESSAGE({ webhookId: interaction.applicationId, webhookToken: interaction.interactionToken, messageId: messageId }),
    token: token,
  })
}
