"use strict";

const Pages = {
  INBOX: "inbox",
  SENT: "sent",
  ARCHIVE: "archive",
  COMPOSE: "compose",
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

  document.querySelector("#compose-form").addEventListener("submit", (e) => {
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
        load_mailbox("sent");
      });
  });
}

function load_page(page) {
  // Show the mailbox and hide other views
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#inbox-view").style.display = "none";
  document.querySelector("#archive-view").style.display = "none";
  document.querySelector("#sent-view").style.display = "none";

  if (page === Pages.SENT) {
    load_sent_view();
  } else if (page == Pages.INBOX) {
    load_inbox_view();
  } else if (page === Pages.ARCHIVE) {
    load_archive_view();
  } else if (page === Pages.COMPOSE) {
    compose_email();
  }
}

function load_archive_view() {
  document.querySelector("#archive-view").style.display = "block";
  document.querySelector("#archive-view").innerHTML = `
    <h3>Archive</h3>
  `;
}

function load_inbox_view() {
  document.querySelector("#inbox-view").style.display = "block";
  document.querySelector("#inbox-view").innerHTML = `
    <h3>Inbox</h3>
  `;
}

function load_sent_view() {
  document.querySelector("#sent-view").style.display = "block";
  // # sent-list
  fetch("/emails/sent")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      let listItems = "";
      for (let email of data) {
        listItems += `<li class="sent-li">${email.recipients[0]} ${email.subject} ${email.timestamp}</li>`;
      }
      document.querySelector("#sent-list").innerHTML = listItems;
    });
}
