<template>
	<el-container>
		<el-main>
			<div class="flex_start mb10">
				<el-input placeholder="请输入搜索关键字" clearable v-model="tableSet.keywords" class="search-ipt">
					<el-button slot="append" icon="el-icon-search" @click="search"></el-button>
				</el-input>
				<el-button type="warning" @click="showAll" class="ml10">显示全部</el-button>
				<!-- <el-button type="primary" @click="showDialog">添加商品</el-button> -->
				<el-button type="primary" @click="dialogImport=true">导入订单</el-button>
			</div>
			<el-table :data="tableData" style="width: 100%" v-loading="tableSet.loading">
				<el-table-column type="expand">
					<template slot-scope="props">
						<el-form label-position="left" inline class="demo-table-expand">
							<el-form-item label="订单流水号">
								<span>{{ props.row.serialNum }}</span>
							</el-form-item>
							<el-form-item label="商品单价">
								<span>{{ props.row.unitPrice }}</span>
							</el-form-item>
							<el-form-item label="承运快递">
								<span>{{ props.row.express }}</span>
							</el-form-item>
							<el-form-item label="订单金额">
								<span>{{ props.row.totalPrice }}</span>
							</el-form-item>
							<el-form-item label="快递单号">
								<span>{{ props.row.waybillNum }}</span>
							</el-form-item>
							<el-form-item label="配送地址">
								<span>{{ props.row.address }}</span>
							</el-form-item>
							<el-form-item label="备注">
								<span>{{ props.row.remark }}</span>
							</el-form-item>
						</el-form>
					</template>
				</el-table-column>
				<el-table-column label="商品名称" prop="proName">
				</el-table-column>
				<el-table-column label="所属店铺" prop="companyName">
				</el-table-column>
				<el-table-column label="商品规格" prop="specName">
				</el-table-column>
				<el-table-column label="商品数量" prop="proCount">
				</el-table-column>
				<el-table-column label="下单用户" prop="name">
				</el-table-column>
				<el-table-column label="联系电话" prop="phone">
				</el-table-column>
				<el-table-column label="导入时间" prop="createdAt">
				</el-table-column>
				<el-table-column label="操作">
					<template slot-scope="scope">
						<el-button size="mini" @click="handleEdit(scope.$index, scope.row)">修改信息</el-button>
						<el-popconfirm title="确定删除这条数据吗？" @onConfirm="handleDelete(scope.$index, scope.row)">
							<el-button size="mini" type="danger" slot="reference">删除</el-button>
						</el-popconfirm>
					</template>
				</el-table-column>
			</el-table>
			<div class="flex_center mt20">
				<el-pagination background :hide-on-single-page="tableSet.pageSize > tableSet.count" @current-change="handleCurrentChange"
				 :current-page="tableSet.currentPage" :page-size="tableSet.pageSize" layout="total, prev, pager, next, jumper"
				 :total="tableSet.count">
				</el-pagination>
			</div>
			<el-dialog title="添加/编辑商品" :visible.sync="dialogVisible" width="30%" :close-on-click-modal="false" :show-close="false">
				<el-form ref="form" :model="form" :rules="rules" label-width="80px">
					<el-form-item label="下单用户" prop="name">
						<el-input v-model="form.name" :maxlength="30" placeholder="请填写用户名"></el-input>
					</el-form-item>
					<el-form-item label="下单用户" prop="phone">
						<el-input v-model="form.phone" :maxlength="30" placeholder="请填写联系电话"></el-input>
					</el-form-item>
					<el-form-item label="配送地址" prop="address">
						<el-input v-model="form.address" :maxlength="30" placeholder="请填写配送地址"></el-input>
					</el-form-item>
					<el-form-item label="备注" prop="remark">
						<el-input v-model="form.remark" :maxlength="30" placeholder="请填写备注"></el-input>
					</el-form-item>
				</el-form>
				<span slot="footer" class="dialog-footer">
					<el-button @click="resetForm('form')">取 消</el-button>
					<el-button type="primary" @click="submitForm('form')">确 定</el-button>
				</span>
			</el-dialog>

			<el-dialog title="导入订单" :visible.sync="dialogImport" width="30%" :close-on-click-modal="false" :show-close="false">
				<el-form ref="importForm" label-width="80px">
					<el-form-item label="所属商家">
						<el-select v-model="company_id" placeholder="请选择">
							<el-option v-for="item in supplys" :key="item.id" :label="item.companyName" :value="item.id">
							</el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="订单文件">
						<el-upload  class="upload-demo"  ref="upload" action="http://shuzhi.loaderwang.cn" accept=".xlsx, .xls" :limit="1"  :file-list="fileList"
						  :before-upload="beforeUpload" :on-remove="handleRemove">
							 <el-button slot="trigger" size="small" type="primary" style="margin-right: 20px">上传excel</el-button>
							 <div slot="tip" class="el-upload__tip">只能上传excel文件，且不超过1MB</div>
						</el-upload>
					</el-form-item>
				</el-form>
				<span slot="footer" class="dialog-footer">
					<el-button @click="resetImportForm">取 消</el-button>
					<el-button type="primary" @click="submitUpload" :loading="loadingSubmit">确 定</el-button>
				</span>
			</el-dialog>
		</el-main>
	</el-container>
</template>

<script>
	import {
		getList,
		saveCg,
		delCg,
		changeCg,
		importOrder
	} from '@/api/order';
	import {
		supplyList
	} from '@/api/supply';
	export default {
		name: 'OrderList',
		data() {
			var validatePhone = (rule, value, callback) => {
				if (value === '') {
					callback(new Error('请输入手机号'));
				} else if (!(/^1[3456789]\d{9}$/.test(value))) {
					callback(new Error('手机号格式错误'));
				} else {
					callback();
				}
			};
			return {
				tableSet: {
					loading: false,
					pageSize: 10,
					count: 100,
					currentPage: 1,
					keywords: ''
				},
				tableData: [],
				index: '',
				dialogVisible: false,
				form: {
					name: '',
					phone: '',
					address: '',
					remark: ''
				},
				rules: {
					name: [{
						required: true,
						message: '下单用户名不能为空',
						trigger: 'blur'
					}],
					phone: [{
						required: true,
						validator: validatePhone,
						trigger: 'blur'
					}],
					address: [{
						required: true,
						message: '配送地址不能为空',
						trigger: 'blur'
					}]
				},
				dialogImport: false,
				supplys: [],
				fileList: [],
				company_id: '',
				fileName: '',
				files: '',
				loadingSubmit: false
			}
		},
		created() {
			this.getData();
			this.getSupply();
		},
		methods: {
			// 获取列表数据
			getData() {
				let self = this,
					set = this.tableSet;
				let data = {
					page: set.currentPage,
					limit: set.pageSize,
					keywords: set.keywords
				}
				set.loading = true;
				getList(data).then(res => {
					set.loading = false;
					self.tableData = res.result.list;
					set.count = res.result.count;
				})
			},

			// 获取商家数据
			getSupply() {
				let self = this;
				supplyList().then(res => {
					console.log(res)
					self.supplys = res.result;
				})
			},

			// 搜索
			search() {
				this.tableSet.currentPage = 1;
				this.getData();
			},
			// 显示全部
			showAll() {
				this.tableSet.keywords = "";
				this.search();
			},

			// 分页
			handleCurrentChange(page) {
				this.tableSet.currentPage = page;
				this.getData();
			},

			// 编辑
			handleEdit(index, row) {
				this.index = index;
				this.form = Object.assign({}, row);
				this.dialogVisible = true;
			},
			// 删除
			handleDelete(index, row) {
				let self = this;
				delCg({
					id: row.id
				}).then(res => {
					self.$message({
						message: '删除成功',
						type: 'success',
						center: true
					});
					self.tableData.splice(index, 1);
					self.tableSet.count --;
				})
			},

			// 显示添加弹框
			showDialog() {
				this.form = {
					companyName: "",
					passwd: '',
					phone: ""
				}
				this.dialogVisible = true;
			},
			// 重置表单信息
			resetForm(formName) {
				this.dialogVisible = false;
				this.$refs[formName].resetFields();
			},
			// 提交表单
			submitForm(formName) {
				this.$refs[formName].validate((valid) => {
					if (valid) {
						this.saveForm(formName);
					} else {
						console.log('验证失败');
						return false;
					}
				});
			},
			saveForm(formName) {
				let self = this;
				let data = {
					name: this.form.name,
					phone: this.form.phone,
					address: this.form.address,
					remark: this.form.remark
				}
				if (this.form.hasOwnProperty('id')) {
					data.id = this.form.id;
				}
				saveCg(data).then(res => {
					self.dialogVisible = false;
					self.$message({
						message: '操作成功',
						type: 'success',
						center: true
					});
					// 重置
					self.$refs[formName].resetFields();
					if (data.hasOwnProperty('id')) {
						self.getData();
					} else {
						self.showAll();
					}
				})
			},
			
			// 重置导入弹框数据
			resetImportForm() {
				this.dialogImport = false;
				this.company_id = "";
				this.fileName = ""; 
				this.fileList = [];
			},
			
			// 上传文件
			beforeUpload(file) {
				this.files = file;
				let extension = file.name.split('.')[1] === 'xls';
				let extension2 = file.name.split('.')[1] === 'xlsx';
				let isLt1M = file.size / 1024 / 1024 < 1;
				if (!extension && !extension2) {
					this.$message.warning({
						message: '上传模板只能是 xls、xlsx格式!',
						center: true
					})
					return false;
				}
				if (!isLt1M) {
					this.$message.warning({
						message: '上传模板大小不能超过 1MB!',
						center: true
					})
					return false;
				}
				this.fileName = file.name;
			},
			
			// 删除文件
			handleRemove(file, fileList) {
				this.fileName = ""; 
				this.files = "";
			},
			
			// 提交导入
			submitUpload() {
				if (this.company_id == "") {
					this.$message.warning({
						message: '请选择所属商家',
						center: true
					})
					return false;
				}
				if (this.fileName == "") {
					this.$message.warning({
						message: '请选择要上传的文件！',
						center: true
					})
					return false;
				}
				let fileFormData = new FormData();
				fileFormData.append('file', this.files);
				fileFormData.append('company_id', this.company_id);
				let self = this;
				this.loadingSubmit = true;
				importOrder(fileFormData).then(res => {
					this.$message.success({
						message: '订单导入成功！',
						center: true
					})
					self.resetImportForm();
					self.loadingSubmit = false;
					setTimeout(() => {
						self.showAll();
					}, 1000)
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.search-ipt {
		width: 300px;
	}

	.demo-table-expand {
		font-size: 0;
	}

	.demo-table-expand label {
		width: 90px;
		color: #99a9bf;
	}

	.demo-table-expand .el-form-item {
		margin-right: 0;
		margin-bottom: 0;
		width: 50%;
	}
</style>
