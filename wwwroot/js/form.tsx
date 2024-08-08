import { createRoot } from "react-dom/client";
import { ReactElement, useState } from "react";

declare var okToSubmit: boolean

type Action<T> = ((x: T) => void)

const pageId = "form";
const content = document.getElementById(pageId);
if (content) {
  const root = createRoot(content);
  root.render(createContent());
}

function createContent(): ReactElement {
  return <FormContent />
}

class Step {
  isOnlyStep = false
  id = ++Step.instance
  constructor(public value: string = "") { }
  static instance = 0
}

export function FormContent() {
  const products = [
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
  let [title, setTitle] = useState("")
  let [description, setDescription] = useState("")
  let [product, setProduct] = useState("")
  let [zendeskTicketNumber, setZendeskTicketNumber] = useState("")
  let [customer, setCustomer] = useState("")
  let [user, setUser] = useState("")
  let [customersImpacted, setCustomersImpacted] = useState(0)
  let [stepsToReproduce, setStepsToReproduce] = useState<Step[]>([
    new Step(), // Starting state (at least one input)
  ])
  // Represents a Step that has just been added via the UI
  let [newStep, setNewStep] = useState<Step | null>(null)
  let timeoutHandle = -1
  return (
    <div className="wrapper"
         ref={_ => {
              if (timeoutHandle) {
                clearTimeout(timeoutHandle)
              }
              timeoutHandle = setTimeout(() => {
                setNewStep(null)
                timeoutHandle = 0
              }, 100)
           }
         }>
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
                    className="focusable"
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
          <label htmlFor="customersImpacted">Customers Impacted</label>
          <input id="customersImpacted"
                 type="number"
                 min="0"
                 name="customersImpacted"
                 className="focusable field-1"
                 autoComplete="off"
                 value={customersImpacted}
                 onChange={e => setCustomersImpacted(parseInt(e.target.value, 10) || 0)}
          />
        </fieldset>

        <fieldset>
          <label htmlFor="urgency">Urgency</label>
          <select id="urgency" name="urgency" className="field-1">
            {
              urgencyScale.map((urgencyName, i) =>
                <option key={i} value={urgencyName}>{urgencyName}</option>
              )
            }
          </select>
        </fieldset>

        <fieldset>
          <div>
            <span className="mr-5">Steps to reproduce (<code>Enter</code> to add step)</span>
            <ol>
              {
                stepsToReproduce.map((step, i, { length: len }) =>
                  <StepToReproduce
                      key={step.id}
                      step={step}
                      newStep={newStep}
                      setNewStep={setNewStep}
                      removeStep={len-1 === i ? null : removeStep}
                      addStep={addStep}
                  />
                )
              }
            </ol>
          </div>
        </fieldset>

        <fieldset>
          <input type="submit" value="Submit" onClick={submitClick} />
        </fieldset>
      </div>

      <div className="preview pane">
        <strong className="mr-5">Your submission will look like this in Linear</strong>
        <a href="#">(copy)</a>
        <hr />
        <div>Markdown goes here</div>
      </div>
    </div>
  )

  function addStep(s: Step) {
    setNewStep(s)
    setStepsToReproduce([...stepsToReproduce, s])
  }

  function removeStep(a: Step) {
    stepsToReproduce.splice(stepsToReproduce.indexOf(a), 1);
    setStepsToReproduce([...stepsToReproduce])
  }

  function submitClick(e: React.MouseEvent<HTMLInputElement>) {
    okToSubmit = true
    document.forms[0].submit()
  }
}

type StepToReproduceProps = {
  step: Step,
  newStep: Step|null,
  setNewStep: Action<Step|null>,
  removeStep: Action<Step>|null,
  addStep: Action<Step>,
}

function StepToReproduce({ step, newStep, setNewStep, removeStep, addStep }: StepToReproduceProps) {
  const [value, setValue] = useState(step.value)
  return <li>
    <div className="step">
      <input type="text"
             onChange={onChange}
             name="stepsToReproduce"
             onKeyDown={onKeyDown}
             className="mr-5 field-1"
             autoComplete="off"
             value={value}
             ref={el => step === newStep ? (setNewStep(null), el?.focus()) : null}
      />
      <button onClick={_ => removeStep?.(step)}
              disabled={!removeStep}>
        Remove
      </button>
    </div>
  </li>

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key?.toLowerCase() === "enter") {
      addStep(new Step())
      e.preventDefault()
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setValue(step.value = e.target.value)
  }
}

function markTouched(e: React.FocusEvent<HTMLElement>): void {
  (e.target as HTMLElement)?.classList.add("touched")
}
