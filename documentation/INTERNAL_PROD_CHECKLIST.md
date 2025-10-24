# ✅ Production Release Checklist

_For Major Updates Going to Production_

This checklist ensures both the **technical stability** of the release and that **communication resources** are in place to inform and support the rest of the company and our user base.

---

## 🧪 1. Technical Readiness

### 🔍 Pre-Merge Verification

- [ ] All automated CI checks are passing
- [ ] Code adheres to current **Testing Standards**
- [ ] Pull Request checklist is fully complete
- [ ] Manual testing has been performed (where necessary)
- [ ] In-App announcement notification has been created & configured properly for release

### 🚦 Final PR Validation

- [ ] merge PR has been reviewed approved by all nessessary team members
- [ ] No critical bugs or blockers are open
- [ ] All stakeholders of new features have recieved demos and given approval

---

## 📣 2. Team & Customer Communication Prep

### 🗓️ 2–3 Days Before the Release

- [ ] **Walkthrough videos** are recorded and ready for internal or public distribution  
       _Demo key changes in UI, workflows, or major behaviors_

- [ ] Draft **Slack Announcement** prepared for internal announcement, to be posted in **#tech-announcements**  
       _Should link walkthrough videos if applicable_

- [ ] **New Release Email** is written, reviewed, and shared with the admin team for distribution
      _Format: Clear, non-technical language suitable for support & marketing_
      _Should link walkthrough if applicable_

- [ ] Draft **email** announcement prepared for external users  
       _Targeted to students; reviewed admin or marketing team_
      _Should link walkthrough if applicable_

- [ ] (Optional) Draft a **Slack announcement** for cohorts and other student slack channels, if relevant

---

## 📤 3. Day-of-Release Tasks

- [ ] Merge PR
- [ ] Verify post-merge codebase successfully built & deployed without errors
- [ ] Post Slack announcement in **#tech-announcements**
- [ ] Send **email to students/customers**

- [ ] Monitor logs, analytics, and feedback channels for issues

---

## 🔄 Post-Release

- [ ] Confirm no immediate regressions or critical errors
- [ ] Mark the release as "Complete" in tracking system
- [ ] Gather feedback internally and externally for next iteration

---

📌 _Note: It is the responsibility of the Tech Team to verify technical rediness, prepare all relevent communication documents, and distribute them to the nessessary interal recipients. It is the responsibility of the Admin department to distribute all relevent communication documents to their external recipients._
