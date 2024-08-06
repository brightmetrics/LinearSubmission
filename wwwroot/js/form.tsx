import { createRoot } from "react-dom/client";
import { ReactElement, useState } from "react";

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
  value = ""
  setValue: any
  constructor() {
    const [v, s] = useState("")
    this.value = v;
    this.setValue = (next: string) => s(next)
  }
  onKeyDown(e: { key: string }) {
    if (e.key === "Enter") {
      setNewStep(this)
      addStep(this)
    }
  }
}

function addStep(s: Step) {
  setNewStep(s)
  setStepsToReproduce([...stepsToReproduce, s])
}

function removeStep(a: Step) {
  setStepsToReproduce(stepsToReproduce.filter(b => b !== a))
}

function submitClick() {
  console.log(title, description, product, zendeskTicketNumber, customer, user, customersImpacted, stepsToReproduce, newStep);
}

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
let [stepsToReproduce, setStepsToReproduce] = useState<Step[]>([])
let [newStep, setNewStep] = useState<Step | null>(null)

export function FormContent() {
  return (
    <div className="wrapper">
      <div className="editor pane">
        <h1>Linear Bug Template</h1>

        <fieldset>
          <label htmlFor="title">Title*</label>
          <input id="title"
                 type="text"
                 name="title"
                 className="field-1"
                 value={title}
                 autoComplete="off"
                 onChange={e => setTitle(e.target.value)}
          />
        </fieldset>

        <fieldset>
          <label htmlFor="desc">Description*</label>
          <textarea id="desc"
                    name="description"
                    placeholder="What sort of expectation isn't being met?"
                    rows={10}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
          ></textarea>
        </fieldset>

        <fieldset>
          <label htmlFor="product">Product*</label>
          <select id="product"
                  name="product"
                  className="field-1"
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
                 className="field-1"
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
                 className="field-1"
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
                 className="field-1"
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
                 className="field-1"
                 autoComplete="off"
                 value={customersImpacted}
                 onChange={e => setCustomersImpacted(parseInt(e.target.value, 10) || 0)}
          />
        </fieldset>

        <fieldset>
          <label htmlFor="urgency">Urgency</label>
          <select id="urgency" name="urgency" className="field-1">
            {
              urgencyScale.map(urgencyName =>
                <option value={urgencyName}>{urgencyName}</option>
              )
            }
          </select>
        </fieldset>

        <fieldset>
          <div>
            <span className="mr-5">Steps to reproduce (<code>Enter</code> to add step)</span>
            <ol>
              {
                stepsToReproduce.map((step, i) => {
                  return <li>
                    <div className="step">
                      <input type="text"
                             key={i}
                             onKeyDown={step.onKeyDown}
                             className="mr-5 field-1"
                             autoComplete="off"
                             value={step.value}
                             onChange={e => step.setValue(e.target.value)}
                             ref={el => step === newStep ? el?.focus() : null}
                      />
                      <button onClick={_ => removeStep(step)}
                              ref={el => stepsToReproduce.length === 1 && el && (el.disabled=true) }>
                        Remove
                      </button>
                    </div>
                  </li>
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
        <strong className="mr-5">Your submission will look like this in Linear</strong>
        <a href="javascript:void(0)">(copy)</a>
        <hr />
        <div>Markdown goes here</div>
      </div>
    </div>
  )
}
