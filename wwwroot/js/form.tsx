import { marked } from "marked";
import { createRoot } from "react-dom/client";
import { ReactElement, useState } from "react";

declare const PAGE: string

type Action<T> = ((x: T) => void)
type FormFields = {
  title: string
  description: string
  product: string
  customer: string
  user: string
  customersImpacted: string
  stepsToReproduce: Step[]
  urgency: number
  zendeskTicketNumber: string
}

if (typeof PAGE === "string" && PAGE === "bug-form") {
  const root = createRoot(document.forms[0]);
  root.render(createContent());
}

function createContent(): ReactElement {
  return <FormContent />
}

class Step {
  public id = ++Step.nextid
  constructor(public value: string = "") { }
  static nextid = 0
}

const products = [
  "Broadvoice",
  "Genesys",
  "MiCC",
  "MiVB",
  "MiVC",
  "MiVC-CC (ECC)",
  "NICE CXOne",
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
  "Multiple",
  "Many",
  "Most",
]

export function FormContent() {
  let [title, setTitle] = useState("")
  let [description, setDescription] = useState("")
  let [product, setProduct] = useState(products[0])
  let [zendeskTicketNumber, setZendeskTicketNumber] = useState("")
  let [customer, setCustomer] = useState("")
  let [urgency, setUrgency] = useState(0)
  let [user, setUser] = useState("")
  let [customersImpacted, setCustomersImpacted] = useState(impactedScale[0])
  let [stepsToReproduce, setStepsToReproduce] = useState<Step[]>([new Step()])
  // Represents a Step that has just been added via the UI
  let [newStep, setNewStep] = useState<Step | null>(null)
  return (
    <div className="wrapper">
      <div className="editor pane">
        <h1>Linear Bug Template</h1>

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
                    rows={10}
                    value={description}
                    required={true}
                    onBlur={markTouched}
                    onChange={e => setDescription(e.target.value)}
          ></textarea>
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
          <div>
            <label className="mr-5">Steps to reproduce, links, or free form items (<kbd>Enter</kbd> to add item)</label>
            <ol>
              {
                stepsToReproduce.map((step, i, { length: len }) => {
                  return <StepToReproduce
                      key={step.id}
                      step={step}
                      stepsToReproduce={stepsToReproduce}
                      newStep={newStep}
                      setNewStep={setNewStep}
                      removeStep={len === 1 ? null : removeStep}
                      addStep={addStep}
                      updateStep={updateStep}
                  />
                })
              }
            </ol>
          </div>
        </fieldset>

        <fieldset>
          <input type="submit" value="Submit" onClick={submitClick} />
        </fieldset>
      </div>
    </div>
  )

  function addStep(index: number) {
    const step = new Step()
    setNewStep(step)
    if (index >= stepsToReproduce.length) {
      setStepsToReproduce([...stepsToReproduce, step])
    } else {
      stepsToReproduce.splice(index, 0, step)
      setStepsToReproduce([...stepsToReproduce])
    }
  }

  function updateStep(s: Step) {
    const i = stepsToReproduce.findIndex(_s => _s.id === s.id)
    stepsToReproduce.splice(i, 1, s)
    setStepsToReproduce([...stepsToReproduce])
  }

  function removeStep(s: Step) {
    const i = stepsToReproduce.findIndex(_s => _s.id === s.id)
    stepsToReproduce.splice(i, 1);
    setStepsToReproduce([...stepsToReproduce])
  }

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
    mdElement.value = createMarkdown({
      customer,
      customersImpacted,
      description,
      product,
      stepsToReproduce,
      title,
      urgency,
      user,
      zendeskTicketNumber,
    })
    return mdElement;
  }

  function markTouched(e: React.FocusEvent<HTMLElement>): void {
    (e.target as HTMLElement)?.classList.add("touched")
  }
}

type StepToReproduceProps = {
  step: Step
  stepsToReproduce: Step[]
  newStep: Step|null
  setNewStep: Action<Step|null>
  removeStep: Action<Step>|null
  addStep: Action<number>
  updateStep: Action<Step>
}

function StepToReproduce({
  step,
  stepsToReproduce,
  newStep,
  setNewStep,
  removeStep,
  addStep,
  updateStep,
}: StepToReproduceProps) {
  const isFirstStep = stepsToReproduce.indexOf(step) === 0;
  return <li>
    <div className="step">
      <textarea onChange={onChange}
                name="stepsToReproduce"
                onKeyDown={onKeyDown}
                placeholder={isFirstStep ? "e.g. See http://bmetrics.co/tab/NnK5BnaQ" : ""}
                className="mr-5 field"
                autoComplete="off"
                value={step.value}
                rows={1}
                ref={el => step === newStep && (setNewStep(null), el?.focus())}
      ></textarea>
      <button type="button"
              onClick={_ => removeStep?.(step)}
              disabled={!removeStep}>
        Remove
      </button>
    </div>
  </li>

  function onKeyDown(e: React.KeyboardEvent<HTMLElement>): void {
    if (e.key?.toLowerCase() === "enter") {
      const index = stepsToReproduce.indexOf(step)
      addStep(index + 1)
      e.preventDefault()
    }
  }

  function onChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    step.value = e.target.value
    updateStep(step)
  }
}
//
// Markdown helpers
//
function createMarkdown({
  customer,
  customersImpacted,
  description,
  product,
  stepsToReproduce,
  title,
  user,
  zendeskTicketNumber,
}: FormFields): string {
  const steps = stepsToReproduce.map(s => s.value)
  const sections = [
    createParagraph(description),
    ...createTable(
      ["Product", "Customer", "Impacted"],
      [product ?? "N/A", customer ?? "N/A", customersImpacted]),
  ]
  if (steps.some(s => s.trim().length > 0)) {
    sections.push(
      createHeader(3, "Notes"),
      ...createOrderedList(steps ?? []))
  }
  return sections.join("\n")
}

function createHeader(level: number, text: string): string {
  return `${"#".repeat(level)} ${text}`
}

function createParagraph(text: string): string {
  return text
}

function createTable(headers: string[], cells: string[]): string[] {
  const headerRow = "| " + headers.map(escapeMdTokens).join(" | ") + " |";
  const separator = "| " + headers.map(_ => "---").join(" | ") + " |"
  const bodyRow = "| " + cells.map(escapeMdTokens).join(" | ") + " |"
  return [headerRow, separator, bodyRow]

  function escapeMdTokens(text: string): string {
    return text.replace("|", "\|")
  }
}

function createOrderedList(items: string[]): string[] {
  return items.filter(i => i.trim()).map(i => "1. " + i)
}
