"use strict";

const Pages = {
  INBOX: "inbox",
  SENT: "sent",
  ARCHIVE: "archive",
  COMPOSE: "compose",
  EMAIL: "email",
};

document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_page(Pages.INBOX));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_page(Pages.SENT));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_page(Pages.ARCHIVE));
  document
    .querySelector("#compose")
    .addEventListener("click", () => load_page(Pages.COMPOSE));

  document
    .querySelector("#compose-form")
    .addEventListener("submit", handleSubmitEmail);

  // By default, load the inbox
  load_page(Pages.INBOX);
});

// Clear out composition fields
function clearEmailForm() {
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#compose-view").style.display = "block";

  clearEmailForm();
  document.querySelector("#button").disabled = false;
}

function handleSubmitEmail(e) {
  console.log("form event", e);
  e.preventDefault();
  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: document.querySelector("#compose-recipients").value,
      subject: document.querySelector("#compose-subject").value,
      body: document.querySelector("#compose-body").value,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log("email POST result:", result);
      clearEmailForm();
      document.querySelector("#button").disabled = true;
      load_page("sent");
    });
}

function load_page(page, options = {}) {
  // Show the mailbox and hide other views
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#inbox-view").style.display = "none";
  document.querySelector("#archive-view").style.display = "none";
  document.querySelector("#sent-view").style.display = "none";
  document.querySelector("#email-detail").style.display = "none";

  if (page === Pages.SENT) {
    load_sent_view();
  } else if (page == Pages.INBOX) {
    load_inbox_view();
  } else if (page === Pages.ARCHIVE) {
    load_archive_view();
  } else if (page === Pages.COMPOSE) {
    compose_email();
  } else if (page === Pages.EMAIL) {
    load_email_view(options);
  }
}

function load_archive_view() {
  document.querySelector("#archive-view").style.display = "block";
  // archive-list

  fetch("/emails/inbox")
    .then((response) => response.json())
    .then((emails) => {
      console.log(emails);
      let tr = "";
      for (let email in emails) {
        if (email.archived === true) {
          tr += `
            <tr>
              <td>${email.recipients[0]}</td
              <td>${email.subject}</td>
              <td>${email.timestamp}</td>
            </tr>
        `;
        }
      }

      document.querySelector("#archive-list").innerHTML = `${tr}`;
    });
}

// function to sort the emails from most recent
function sortEmails(key) {
  return function (a, b) {
    if (a[key] > b[key]) return 1;
    else if (a[key] < b[key]) return -1;
  };
}

function load_inbox_view() {
  document.querySelector("#inbox-view").style.display = "block";

  fetch("/emails/inbox")
    .then((response) => response.json())
    .then((emails) => {
      console.log(emails);
      document.querySelector("#inbox-list").innerHTML = "";
      for (let email of emails) {
        let tr = document.createElement("tr");
        let subjectTD = document.createElement("td");
        let link = document.createElement("a");
        link.innerText = email.subject;
        link.href = "#";
        link.addEventListener("click", (e) => {
          e.preventDefault();
          load_page(Pages.EMAIL, { id: email.id });
        });
        subjectTD.appendChild(link);

        tr.appendChild(subjectTD);
        let senderTD = document.createElement("td");
        senderTD.innerText = email.sender;
        tr.appendChild(senderTD);

        let timestampTD = document.createElement("td");
        timestampTD.innerText = email.timestamp;
        tr.appendChild(timestampTD);
        document.querySelector("#inbox-list").appendChild(tr);
      }
    });
}

function load_sent_view() {
  document.querySelector("#sent-view").style.display = "block";
  // # sent-list
  fetch("/emails/sent")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      // let tr = "";
      for (let email of data) {
        let tr = document.createElement("tr");
        tr.innerHTML = `
          <td><a href="#">${email.subject}<a/></td>
          <td>${email.recipients[0]}</td>
          <td>${email.timestamp}</td>
        `;

        tr.querySelector("a").addEventListener("click", (e) => {
          e.preventDefault();
          load_page(Pages.EMAIL, { id: email.id });
        });

        document.querySelector("#sent-list").appendChild(tr);
      }
    });
}

function load_email_view({ id }) {
  document.querySelector("#email-detail").style.display = "block";
  fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      document.querySelector("#sender").innerHTML = data.sender;
      document.querySelector("#recipient").innerHTML = data.recipients;
      document.querySelector("#time").innerHTML = data.timestamp;
      document.querySelector("#subject").innerHTML = data.subject;
      document.querySelector("#body").innerHTML = data.body;
    });
}
