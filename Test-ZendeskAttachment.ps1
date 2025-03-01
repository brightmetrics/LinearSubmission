param([string]$issueId, [string]$ticketId)
# ==============================
# Mutation.attachmentLinkZendesk
# ==============================
$payload = @{
    query = "mutation IssueAttachmentMutation(`$ticketId: String!, `$issueId: String!) { attachmentLinkZendesk(ticketId: `$ticketId, issueId: `$issueId) { success } }";
    operationName = "IssueAttachmentMutation";
    variables = @{
        ticketId = $ticketId;
        issueId = $issueId;
    }
} | ConvertTo-Json -Depth 10

<#
# =========================
# Mutation.attachmentCreate
# =========================
$payload = @{
    query = "mutation IssueAttachmentMutation(`$input: AttachmentCreateInput!) { attachmentCreate(input: `$input) { success } }";
    operationName = "IssueAttachmentMutation";
    variables = @{
        input = @{
            url = "https://brightmetrics.zendesk.com/tickets/$ticketId";
            title = "Ticket $ticketId";
            issueId = $issueId;
        }
    }
} | ConvertTo-Json -Depth 10
#>
$payload

$token = $env:LINEAR_AUTH_TOKEN
$uri = "https://api.linear.app/graphql"
$headers = @{ "Authorization" = "Bearer $token" }
$response = Invoke-WebRequest -Uri $uri -Method Post -Headers $headers -Body $payload -ContentType "application/json"
$jsonString = $response.Content
$jsonString
