param([string]$issueId, [string]$ticketId)
<#
Mutation.integrationZendesk(subdomain)
Mutation.integrationZendesk(code)
Mutation.integrationZendesk(scope)
Mutation.integrationZendesk(redirectUri)
---
Mutation.attachmentLinkZendesk(createAsUser)
Mutation.attachmentLinkZendesk(displayIconUrl)
Mutation.attachmentLinkZendesk(title)
Mutation.attachmentLinkZendesk(url)
Mutation.attachmentLinkZendesk(ticketId)
Mutation.attachmentLinkZendesk(issueId)
Mutation.attachmentLinkZendesk(id)
#>
$payload = @{
    #query = "mutation IssueAttachmentMutation(`$ticketId: String!, `$issueId: String!) { attachmentLinkZendesk(ticketId: `$ticketId, issueId: `$issueId) { success } }";
    query = "mutation IssueAttachmentMutation(`$input: AttachmentCreateInput!) { attachmentCreate(input: `$input) { success } }";
    operationName = "IssueAttachmentMutation";
    variables = @{
        input = @{
            url = "https://brightmetrics.zendesk.com/tickets/$ticketId";
            #ticketId = $ticketId;
            title = "Ticket $ticketId";
            #issueId = "1e5a1620-40f7-44b1-9271-da411e97e35f";
            issueId = $issueId;
        }
    }
} | ConvertTo-Json -Depth 10
$payload

$token = $env:LINEAR_AUTH_TOKEN
$uri = "https://api.linear.app/graphql"
$headers = @{ "Authorization" = "Bearer $token" }
$response = Invoke-WebRequest -Uri $uri -Method Post -Headers $headers -Body $payload -ContentType "application/json"
$jsonString = $response.Content
$jsonString
