import { createRoot } from "react-dom/client";
import { ReactElement, useState } from "react";

type FormFields = {
  title: string
  description: string
  product: string
  customer: string
  user: string // Currently not used
  customersImpacted: string
  notes: string
  urgency: number
  escalation: boolean
  zendeskTicketNumber: string
}

const products = [
  "Not platform specific",
  "Broadvoice",
  "CXone",
  "Enterprise",
  "Genesys",
  "MiCC",
  "MiVB",
  "MiVC",
  "ECC",
  "RingCentral",
  "Scorecards",
]

const urgencyScale = [
  "None",
  "Urgent",
  "High",
  "Medium",
  "Low",
]

const impactedScale = [
  "Unknown",
  "One",
  "A few",
  "Many",
  "Most",
]

const root = createRoot(document.forms[0]);
root.render(createContent());

function createContent(): ReactElement {
  return <FormContent />
}

export function FormContent() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [workaround, setWorkaround] = useState(false)
  const [workaroundDesc, setWorkaroundDesc] = useState("")
  const [product, setProduct] = useState(products[0])
  const [zendeskTicketNumber, setZendeskTicketNumber] = useState(getZendeskParameter())
  const [customer, setCustomer] = useState("")
  const [urgency, setUrgency] = useState(0)
  const [user, setUser] = useState("")
  const [customersImpacted, setCustomersImpacted] = useState(impactedScale[0])
  const [notes, setNotes] = useState("")
  const [escalation, setEscalation] = useState(false)
  return (
    <div className="wrapper">
      <div className="editor pane">
        <h1 style={{ textAlign: "center" }}>Bug Form</h1>

        <fieldset>
          <label htmlFor="title">Title*</label>
          <input id="title"
                 type="text"
                 name="title"
                 className="focusable field"
                 value={title}
                 autoComplete="off"
                 required={true}
                 onBlur={markTouched}
                 onChange={e => setTitle(e.target.value)}
          />
        </fieldset>

        <fieldset>
          <label htmlFor="desc">Description*</label>
          <textarea id="desc"
                    name="description"
                    className="focusable field"
                    placeholder="What sort of expectation isn't being met?"
                    title="Markdown supported"
                    rows={10}
                    value={description}
                    required={true}
                    onBlur={markTouched}
                    onChange={e => setDescription(e.target.value)}
          ></textarea>
        </fieldset>

        <fieldset>
          <label htmlFor="workaround">
            <input id="workaround"
                   type="checkbox"
                   className="field"
                   checked={workaround}
                   onChange={e => setWorkaround(e.target.checked)}
            />
            <span style={{marginLeft:"5px"}}>Is there a workaround?</span>
          </label>
          {
            workaround &&
              <textarea id="workaroundDesc"
                        className="focusable field"
                        placeholder="Explain the workaround here"
                        title="Markdown supported"
                        rows={5}
                        value={workaroundDesc}
                        onChange={e => setWorkaroundDesc(e.target.value)}
              ></textarea>
          }
        </fieldset>

        <fieldset>
          <label htmlFor="product">Product</label>
          <select id="product"
                  name="product"
                  className="focusable field"
                  onChange={e => setProduct(e.target.value)}>
            {
              products.map((productName, i) => {
                return <option key={i}
                               value={productName}>
                  {productName}
                </option>
              })
            }
          </select>
        </fieldset>

        <fieldset>
          <label htmlFor="zendeskTicketNumber">Zendesk Ticket #</label>
          <input id="zendeskTicketNumber"
                 type="number"
                 min="0"
                 max="999999"
                 name="zendeskTicketNumber"
                 placeholder="If applicable"
                 className="focusable field"
                 autoComplete="off"
                 value={zendeskTicketNumber}
                 onChange={e => setZendeskTicketNumber(e.target.value)}
          />
        </fieldset>

        <fieldset>
          <label htmlFor="customer">Customer</label>
          <input id="customer"
                 type="text"
                 name="customer"
                 placeholder="If applicable"
                 className="focusable field"
                 autoComplete="off"
                 value={customer}
                 onChange={e => setCustomer(e.target.value)}
          />
        </fieldset>

        <fieldset style={{ display: "none" }}>
          <label htmlFor="user">User</label>
          <input id="user"
                 type="text"
                 name="user"
                 placeholder="If applicable"
                 className="focusable field"
                 autoComplete="off"
                 value={user}
                 onChange={e => setUser(e.target.value)}
          />
        </fieldset>

        <fieldset>
          <label htmlFor="customersImpacted">Number of Impacted</label>
          <select id="customersImpacted"
                  name="customersImpacted"
                  className="field"
                  value={customersImpacted}
                  onChange={e => setCustomersImpacted(e.target.value)}
          >
            {
              impactedScale.map((name, i) =>
                <option key={i} value={name}>{name}</option>
              )
            }
          </select>
        </fieldset>

        <fieldset>
          <label htmlFor="urgency">Urgency</label>
          <select id="urgency"
                  name="urgency"
                  className="field"
                  value={urgency}
                  onChange={e => setUrgency(parseInt(e.target.value, 10))}
          >
            {
              urgencyScale.map((name, i) =>
                <option key={i} value={i}>{name}</option>
              )
            }
          </select>
        </fieldset>

        <fieldset>
          <label htmlFor="escalation">
            <input id="escalation"
                   type="checkbox"
                   name="escalation"
                   className="field"
                   checked={escalation}
                   onChange={e => setEscalation(e.target.checked)}
            />
            <span style={{marginLeft:"5px"}}>Is this from an escalation?</span>
          </label>
        </fieldset>

        <fieldset>
          <label htmlFor="desc">Notes and links</label>
          <textarea id="notes"
                    name="notes"
                    className="focusable field"
                    placeholder="Go to this report http://..."
                    title="Markdown supported"
                    rows={10}
                    value={notes}
                    onBlur={markTouched}
                    onChange={e => setNotes(e.target.value)}
          ></textarea>
        </fieldset>

        <fieldset>
          <input className="submit button"
                 type="submit"
                 value="Submit To Linear"
                 onClick={submitClick} />
        </fieldset>
      </div>
    </div>
  )

  function submitClick(e: React.PointerEvent<HTMLInputElement>) {
    const submit = e.target as HTMLInputElement
    // Ignore synthetic events due to hitting ENTER in an input, etc.
    if (e.nativeEvent.pointerId === -1 || submit.disabled) {
      e.preventDefault()
      return false
    }
    const form = document.forms[0]
    if (form.reportValidity()) {
      form.appendChild(createHiddenMarkdownFormField());
      form.submit()
      submit.disabled = true
    }
  }

  function createHiddenMarkdownFormField(): HTMLInputElement {
    const id = "markdown-field";
    const existing = document.getElementById(id);
    // Should never happen but idk
    if (existing) {
      existing.remove?.();
    }
    const mdElement = document.createElement("INPUT") as HTMLInputElement;
    mdElement.id = id;
    mdElement.setAttribute("type", "hidden");
    mdElement.setAttribute("name", "markdown");

    let fullDesc = description;
    if (workaround) {
      fullDesc += "\n\nThis issue **does** have a workaround";
      if (workaroundDesc) {
        fullDesc += `:\n${workaroundDesc}`;
      }
    }

    mdElement.value = createMarkdown({
      customer,
      customersImpacted,
      description: fullDesc,
      product,
      notes,
      title,
      urgency,
      user,
      zendeskTicketNumber,
      escalation,
    })
    return mdElement;
  }
}

function markTouched(e: React.FocusEvent<HTMLElement>): void {
  (e.target as HTMLElement)?.classList.add("touched")
}

function createMarkdown({
  customer,
  customersImpacted,
  description,
  notes,
  product,
}: FormFields): string {
  const sections = [
    createParagraph(description),
    ...createTable(
      ["Product", "Customer", "Impacted"],
      [product || "N/A", customer || "N/A", customersImpacted]),
  ]

  if (notes) {
    sections.push(
      createHeader(3, "Notes"),
      createParagraph(notes))
  }

  return sections.join("\n")

  function createHeader(level: number, text: string): string {
    return `${"#".repeat(level)} ${text}`
  }

  function createParagraph(text: string): string {
    return text
  }

  function createTable(headers: string[], cells: string[]): string[] {
    const headerRow = "| " + headers.map(escapeMdTokens).join(" | ") + " |";
    const separator = "| " + headers.map(() => "---").join(" | ") + " |"
    const bodyRow = "| " + cells.map(escapeMdTokens).join(" | ") + " |"
    return [headerRow, separator, bodyRow]
  }

  function escapeMdTokens(text: string): string {
    // eslint-disable-next-line
    return text.replace("|", "\|")
  }
}

function getZendeskParameter(): string {
  let value = ""
  try {
    const params = new URLSearchParams(location.search)
    value = params.get("zd") ?? ""
  } catch { /* ignore */ }
  if (value) {
    const parsed = parseInt(value, 10)
    if (!isNaN(parsed) && isFinite(parsed)) {
      return `${parsed}`
    }
  }
  return ""
}
