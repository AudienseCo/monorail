BRANCH_NAME=$1

cd repository
git --no-pager log --pretty=format:'%H|%B' --abbrev-commit origin/master..$BRANCH_NAME
