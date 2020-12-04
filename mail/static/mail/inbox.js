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
function clearReplyForm() {
  document.querySelector("#reply-recipients").value = "";
  document.querySelector("#reply-subject").value = "";
  document.querySelector("#reply-body").value = "";
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
  document.querySelector("#reply-view").style.display = "none";

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
  } else if (page == Pages.REPLY) {
    load_reply_view(options);
  }
}

function load_archive_view() {
  document.querySelector("#archive-view").style.display = "block";

  fetch("/emails/archive")
    .then((response) => response.json())
    .then((emails) => {
      console.log(emails);
      document.querySelector("#archive-list").innerHTML = "";
      // let tr = "";
      for (let email of emails) {
        let tr = document.createElement("tr");
        tr.innerHTML = `
          <td><a href="#">${email.subject}<a/></td>
          <td>${email.sender}</td>
          <td>${email.timestamp}</td>
        `;

        tr.querySelector("a").addEventListener("click", (e) => {
          e.preventDefault();
          load_page(Pages.EMAIL, { id: email.id, showUnarchiveButton: true });
        });

        document.querySelector("#archive-list").appendChild(tr);
      }
    });
}

// function to sort the emails from most recent

function load_inbox_view() {
  document.querySelector("#inbox-view").style.display = "block";

  fetch("/emails/inbox")
    .then((response) => response.json())
    .then((emails) => {
      console.log(emails);
      document.querySelector("#inbox-list").innerHTML = "";
      for (let email of emails) {
        let tr = document.createElement("tr");
        if (email.read) {
          tr.classList.add("table-active");
        }
        tr.innerHTML = `
          <td><a href="#">${email.subject}<a/></td>
          <td>${email.sender}</td>
          <td>${email.timestamp}</td>
      `;
        tr.querySelector("a").addEventListener("click", (e) => {
          e.preventDefault();
          load_page(Pages.EMAIL, { id: email.id, showArchiveButton: true });

          fetch(`/emails/${email.id}`, {
            method: "PUT",
            body: JSON.stringify({
              read: true,
            }),
          });
        });
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
      document.querySelector("#sent-list").innerHTML = "";
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
          load_page(
            Pages.EMAIL,
            { id: email.id },
            (document.querySelector("#unarchive-button").style.visibility =
              "hidden"),
            (document.querySelector("#archiving-button").style.visibility =
              "hidden")
          );
        });

        document.querySelector("#sent-list").appendChild(tr);
      }
    });
}

function load_email_view({
  id,
  showArchiveButton = false,
  showUnarchiveButton = false,
}) {
  document.querySelector("#email-detail").style.display = "block";
  document.querySelector("#archiving-button").style.visibility = "hidden";
  document.querySelector("#unarchive-button").style.visibility = "hidden";

  if (showArchiveButton) {
    document.querySelector("#archiving-button").style.visibility = "visible";
    document
      .querySelector("#archiving-button")
      .addEventListener("click", (e) => {
        fetch(`/emails/${id}`, {
          method: "PUT",
          body: JSON.stringify({
            archived: true,
          }),
        }).then((response) => load_page(Pages.INBOX));
      });
  } else if (showUnarchiveButton) {
    document.querySelector("#unarchive-button").style.visibility = "visible";
    document
      .querySelector("#unarchive-button")
      .addEventListener("click", (e) => {
        fetch(`/emails/${id}`, {
          method: "PUT",
          body: JSON.stringify({
            archived: false,
          }),
        }).then((response) => load_page(Pages.INBOX));
      });
  }
  fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      document.querySelector("#sender").innerHTML = `Sender: ${data.sender}`;
      document.querySelector("#recipient").innerHTML = `To: ${data.recipients}`;
      document.querySelector("#time").innerHTML = data.timestamp;
      document.querySelector("#subject").innerHTML = `Subject: ${data.subject}`;
      document.querySelector("#body").innerHTML = data.body;
    });
}

// document.querySelector("#reply-button").addEventListener("click", (e) => {
//   document.querySelector("#email-detail").style.display = "none";
//   document.querySelector("#reply-view").style.display = "block";
//   document.querySelector(
//     "#reply-recipient"
//   ).value = `Recipient: ${data.recipients[0]}`;
//   let subject = data.subject;
//   if (subject.substring(0, 2) == "Re") {
//     document.querySelector("#reply-subject").value = subject;
//   } else{
//     document.querySelector(
//       "#reply.subject"
//     ).value = `Re: ${data.subject}`;
//     document.querySelector(
//       "#reply-text"
//     ).innerHTML = `On ${data.timestamp} ${data.sender} Wrote: ${data.body}`;
//   }

// function load_reply_view(id) {
//   document.querySelector("#reply-view").style.display = "block";
//   clearReplyForm();

//   fetch(`/emails/${id}`)
//     .then((response) => response.json())
//     .then((data) => {
//       console.log(data);
//       document.querySelector(
//         "#reply-recipient"
//       ).innerHTML = `Recipient: ${data.recipients[0]}`;
//       let subject = data.subject;
//       if (subject.substring(0, 2) == "Re") {
//         document.querySelector("#reply-subject").innerHTML = subject;
//       } else
//         document.querySelector(
//           "#reply.subject"
//         ).innerHTML = `Re: ${data.subject}`;
//     });
//   document.querySelector(
//     "#reply-text"
//   ).innerHTML = `On ${data.timestamp} ${data.sender} Wrote: ${data.body}`;
// }
