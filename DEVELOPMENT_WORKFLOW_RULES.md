# DEVELOPMENT WORKFLOW RULES - CRITICAL

## 🚨 MANDATORY RULES - NEVER BREAK THESE

### 1. GIT COMMIT RULES
- **EVERY working change MUST be committed immediately**
- **NO exceptions** - if it works, commit it
- **Commit message format**: `FEATURE: Brief description of what was added/fixed`
- **Push to GitHub after every commit** - never lose work again

### 2. BEFORE MAKING ANY CHANGES
- **Create a new branch** for major features
- **Commit current working state** before starting
- **Test thoroughly** before making changes
- **Have a rollback plan**

### 3. DURING DEVELOPMENT
- **Make small, incremental changes**
- **Test after each change**
- **Commit working changes immediately**
- **Push to GitHub regularly**

### 4. NEVER DO THESE
- ❌ Make changes without committing first
- ❌ Break working code without backup
- ❌ Revert to wrong versions
- ❌ Lose user's work
- ❌ Make large changes without testing

### 5. RECOVERY PROCEDURES
- **If code breaks**: Revert to last working commit
- **If file gets corrupted**: Restore from git history
- **If changes are lost**: Check git log and restore

## 📋 WORKFLOW CHECKLIST

### Before Starting Work:
- [ ] Commit current working state
- [ ] Create new branch (if major feature)
- [ ] Test current functionality
- [ ] Document what you're about to change

### During Work:
- [ ] Make small changes
- [ ] Test each change
- [ ] Commit working changes immediately
- [ ] Push to GitHub
- [ ] Document changes made

### After Work:
- [ ] Final test of all functionality
- [ ] Commit final state
- [ ] Push to GitHub
- [ ] Update documentation

## 🎯 SPECIFIC RULES FOR COMMUNITY LOUNGE

### CommunityLoungeView.tsx Rules:
- **NEVER delete without backup**
- **Always commit before major changes**
- **Test chat functionality after changes**
- **Preserve motivational quote feature**
- **Maintain search functionality**
- **Keep thread panel working**

### Search Box Rules:
- **Test search before modifying**
- **Commit working search state**
- **Don't break existing functionality**
- **Test width/height changes carefully**

## 📝 COMMIT MESSAGE EXAMPLES

```
FEATURE: Add motivational quote to chat feed
FIX: Resolve search box width issue
ENHANCE: Improve thread panel styling
SAVE: Working state before search modifications
RESTORE: Revert to working search functionality
```

## 🚨 EMERGENCY PROCEDURES

### If Work is Lost:
1. **Check git log**: `git log --oneline -10`
2. **Find last working commit**
3. **Restore from commit**: `git checkout <commit-hash> -- <file>`
4. **Commit restored version**
5. **Push to GitHub**

### If File is Corrupted:
1. **Don't panic**
2. **Check git status**: `git status`
3. **Restore from last commit**: `git checkout HEAD -- <file>`
4. **Test functionality**
5. **Commit working version**

## 📞 CONTACT

If you break these rules and lose work:
1. **Immediately stop making changes**
2. **Document what was lost**
3. **Check all backup locations**
4. **Inform user of the situation**
5. **Create recovery plan**

---

**REMEMBER: USER'S WORK IS PRECIOUS - NEVER LOSE IT AGAIN**



