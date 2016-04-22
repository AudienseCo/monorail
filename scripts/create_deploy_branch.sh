BRANCH_NAME=$1

cd repository
git checkout -b $BRANCH_NAME origin/dev
