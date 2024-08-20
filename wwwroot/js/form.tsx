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
  urgency: string
  zendeskTicketNumber: string
}

if (PAGE === "bug-form") {
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

export function FormContent() {
  const products = [
    "N/A",
    "Product 1",
    "Product 2",
    "Product 3",
    "Product 4",
    "Product 5",
  ]
  const urgencyScale = [
    "Urgency 1",
    "Urgency 2",
    "Urgency 3",
    "Urgency 4",
    "Urgency 5",
  ]
  const impactedScale = [
    "Unknown",
    "One",
    "Multiple",
    "Many",
    "Most",
  ]
  let [title, setTitle] = useState("")
  let [description, setDescription] = useState("")
  let [product, setProduct] = useState(products[0])
  let [zendeskTicketNumber, setZendeskTicketNumber] = useState("")
  let [customer, setCustomer] = useState("")
  let [urgency, setUrgency] = useState(urgencyScale[0])
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
                 className="focusable field-1"
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
                    className="focusable field-1"
                    placeholder="What sort of expectation isn't being met?"
                    rows={10}
                    value={description}
                    required={true}
                    onBlur={markTouched}
                    onChange={e => setDescription(e.target.value)}
          ></textarea>
        </fieldset>

        <fieldset>
          <label htmlFor="product">Product*</label>
          <select id="product"
                  name="product"
                  className="focusable field-1"
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
                 type="text"
                 name="zendeskTicketNumber"
                 placeholder="If applicable"
                 className="focusable field-1"
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
                 className="focusable field-1"
                 autoComplete="off"
                 value={customer}
                 onChange={e => setCustomer(e.target.value)}
          />
        </fieldset>

        <fieldset>
          <label htmlFor="user">User</label>
          <input id="user"
                 type="text"
                 name="user"
                 placeholder="If applicable"
                 className="focusable field-1"
                 autoComplete="off"
                 value={user}
                 onChange={e => setUser(e.target.value)}
          />
        </fieldset>

        <fieldset>
          <label htmlFor="customersImpacted">Number of Impacted</label>
          <select id="customersImpacted"
                  name="customersImpacted"
                  className="field-1"
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
                  className="field-1"
                  value={urgency}
                  onChange={e => setUrgency(e.target.value)}
          >
            {
              urgencyScale.map((name, i) =>
                <option key={i} value={name}>{name}</option>
              )
            }
          </select>
        </fieldset>

        <fieldset>
          <div>
            <label className="mr-5">Steps to reproduce (<code>Enter</code> to add step)</label>
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

      <div className="preview pane">
        <p className="preview-title">Your submission will look like this in Linear:</p>
        <br />
        <MarkdownContent {...{
          title,
          description,
          product,
          customer,
          customersImpacted,
          urgency,
          stepsToReproduce,
        }} />
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
    const mdElement = document.createElement("INPUT") as HTMLInputElement;
    mdElement.setAttribute("type", "hidden");
    mdElement.setAttribute("name", "markdown");
    mdElement.value = createMarkdown({
      title,
      description,
      product,
      customer,
      customersImpacted,
      urgency,
      stepsToReproduce,
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
  /** number is the step.id */
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
  return <li>
    <div className="step">
      <textarea onChange={onChange}
                name="stepsToReproduce"
                onKeyDown={onKeyDown}
                className="mr-5 field-1"
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
      const target = e.target
      if (e.shiftKey && isTextArea(target)) {
        // Act as if adding a newline
        target.rows += 1
        const len = (target.value += "\n").length
        target.setSelectionRange(len, len)
      } else {
        const index = stepsToReproduce.indexOf(step)
        addStep(index + 1)
        e.preventDefault()
      }
    }
  }

  function isTextArea(n: any): n is HTMLTextAreaElement {
    return n?.nodeName === "TEXTAREA"
  }

  function onChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    step.value = e.target.value
    updateStep(step)
  }
}

type FormFields2 = Omit<FormFields, "zendeskTicketNumber" | "user">

function MarkdownContent(formFields: FormFields2) {
  return <div className="md-content"
              dangerouslySetInnerHTML={compileMarkdown(formFields)}></div>

  function compileMarkdown(formFields: FormFields2) {
    const markdown = createMarkdown(formFields)
    const __html = marked.parse(markdown, { gfm: true }) as string
    return { __html }
  }
}
//
// Markdown helpers
//
function createMarkdown({
  title,
  description,
  product,
  customer,
  customersImpacted,
  stepsToReproduce,
  urgency,
}: FormFields2): string {
  const steps = stepsToReproduce.map(s => s.value)
  return [
    createHeader(1, title),
    createParagraph(description),
    // createNewline(),
    ...createTable(
      ["Product", "Customer", "Impacted", "Urgency"],
      [product ?? "N/A", customer ?? "N/A", customersImpacted, urgency]),
    // createNewline(),
    createHeader(3, "Steps to Reproduce"),
    ...createOrderedList(steps ?? []),
  ].join("\n")
}

function createHeader(level: number, text: string): string {
  return `${"#".repeat(level)} ${text}`
}

function createNewline(count: number = 1) {
  return "\n".repeat(count)
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
